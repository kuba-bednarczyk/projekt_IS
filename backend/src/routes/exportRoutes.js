const express = require("express");
const prisma = require("../config/db");
const router = express.Router();
const yaml = require("yaml");
const { exportSchema } = require("../validations/exportSchemas");

// Test raportu json /api/export/json?cityId=1&marketType=pierwotny&priceType=transakcyjne
router.get("/json", async (req, res) => {
  try {
    const validation = exportSchema.safeParse(req.query);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((issue) => issue.message)
        .join(" | ");
      return res.status(400).json({ success: false, message: errorMessage });
    }
    const { cityId, marketType, priceType } = validation.data;

    // Znajdujemy miasto o podanym ID
    const city = await prisma.city.findFirst({
      where: { id: cityId },
    });
    if (city === 0) {
      return res.status(404).json({
        success: false,
        message: "Miasto o podanym ID nie zostało znalezione.",
      });
    }

    // Znajdujemy ceny mieszkań dla podanego miasta, rynku i typu ceny
    const prices = await prisma.housingPrice.findMany({
      where: {
        cityId: cityId,
        marketType: marketType,
        priceType: priceType,
      },
      orderBy: [{ year: "asc" }, { quarter: "asc" }],
    });

    if (prices.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brak danych o cenie dla tych danych.",
      });
    }
    // Znajdujemy stopy procentowe dla typu "ref"
    const rates = await prisma.interestRate.findMany({
      where: {
        rateType: "ref",
      },
      orderBy: { validFrom: "desc" },
    });

    if (rates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brak danych o stopach procentowych dla tego typu.",
      });
    }
    // Tworzymy historię cen i odpowiadających im stóp procentowych
    const history = prices.map((priceData) => {
      const quarterEndMonth = priceData.quarter * 3;
      const quarterEndDate = new Date(
        Date.UTC(priceData.year, quarterEndMonth, 0, 23, 59, 59),
      );
      const rateData = rates.find((r) => r.validFrom <= quarterEndDate);
      const rawPrice = priceData.price.toNumber();
      const rawRate = rateData ? rateData.rateValue.toNumber() : null;
      const period = priceData.year + " Q" + priceData.quarter;
      return {
        period: period,
        price: rawPrice,
        interestRate: rawRate,
      };
    });

    const firstRecord = prices[0];
    const lastRecord = prices[prices.length - 1];
    res.status(200).json({
      success: true,
      header: {
        description: `Kwartalny raport średnich cen mieszkań w mieście ${city.name} na tle referencyjnych stóp procentowych NBP.`,
        generatedAt: new Date().toISOString(),
        filtersApplied: {
          city: city.name,
          marketType: marketType,
          priceType: priceType,
        },
        length: {
          start: `Q${firstRecord.quarter} ${firstRecord.year}`,
          end: `Q${lastRecord.quarter} ${lastRecord.year}`,
        },
      },
      data: {
        history,
      },
    });
  } catch (error) {
    console.error("Błąd w endpoint /json:", error);
    res.status(500).json({
      success: false,
      message: "Nie udało się pobrać miast",
    });
  }
});

// Test raportu json /api/export/yaml?cityId=1&marketType=pierwotny&priceType=transakcyjne

router.get("/yaml", async (req, res) => {
  try {
    const validation = exportSchema.safeParse(req.query);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((issue) => issue.message)
        .join(" | ");
      return res.status(400).json({ success: false, message: errorMessage });
    }
    const { cityId, marketType, priceType } = validation.data;

    const city = await prisma.city.findFirst({
      where: { id: cityId },
    });
    if (city === 0) {
      return res.status(404).json({
        success: false,
        message: "Miasto o podanym ID nie zostało znalezione.",
      });
    }

    const prices = await prisma.housingPrice.findMany({
      where: {
        cityId: cityId,
        marketType: marketType,
        priceType: priceType,
      },
      orderBy: [{ year: "asc" }, { quarter: "asc" }],
    });

    if (prices.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brak danych o cenie dla tych danych.",
      });
    }
    const rates = await prisma.interestRate.findMany({
      where: {
        rateType: "ref",
      },
      orderBy: { validFrom: "desc" },
    });

    if (rates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brak danych o stopach procentowych dla tego typu.",
      });
    }

    const history = prices.map((priceData) => {
      const quarterEndMonth = priceData.quarter * 3;
      const quarterEndDate = new Date(
        Date.UTC(priceData.year, quarterEndMonth, 0, 23, 59, 59),
      );
      const rateData = rates.find((r) => r.validFrom <= quarterEndDate);
      const rawPrice = priceData.price.toNumber();
      const rawRate = rateData ? rateData.rateValue.toNumber() : null;
      const period = priceData.year + " Q" + priceData.quarter;
      return {
        period: period,
        price: rawPrice,
        interestRate: rawRate,
      };
    });
    const firstRecord = prices[0];
    const lastRecord = prices[prices.length - 1];
    const reportData = {
      success: true,
      header: {
        description: `Kwartalny raport średnich cen mieszkań w mieście ${city.name} na tle referencyjnych stóp procentowych NBP.`,
        generatedAt: new Date().toISOString(),
        filtersApplied: {
          city: city.name,
          marketType: marketType,
          priceType: priceType,
        },
        length: {
          start: `Q${firstRecord.quarter} ${firstRecord.year}`,
          end: `Q${lastRecord.quarter} ${lastRecord.year}`,
        },
      },
      data: history,
    };
    const yamlString = yaml.stringify(reportData);
    res.setHeader("Content-Type", "application/x-yaml");
    res.status(200).send(yamlString);
  } catch (error) {
    console.error("Błąd w endpoint /yaml:", error);
    const errorYaml = yaml.stringify({
      success: false,
      message: "Wewnętrzny błąd serwera podczas generowania raportu.",
    });
    res.setHeader("Content-Type", "application/x-yaml");
    res.status(500).send(errorYaml);
  }
});

module.exports = router;
