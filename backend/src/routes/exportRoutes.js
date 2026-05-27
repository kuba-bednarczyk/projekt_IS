const express = require("express");
const prisma = require("../config/db");
const router = express.Router();
const yaml = require("yaml");
const { exportSchema } = require("../validations/exportSchemas");
const { verifyToken, requireOwnerOrAdmin } = require("../middleware/auth");
const allowedModels = {
  housingPrice: prisma.housingPrice,
  interestRate: prisma.interestRate,
};
async function getTableData(
  tableName,
  { queryParams = {}, orderBy = {}, averageByQuarter = false },
) {
  const dbModel = allowedModels[tableName];
  if (!dbModel) {
    throw new Error("Invalid table name");
  }
  if (averageByQuarter) {
    const groupedData = await dbModel.groupBy({
      by: ["year", "quarter"],
      where: queryParams,
      _avg: {
        price: true,
      },
      orderBy: [{ year: "asc" }, { quarter: "asc" }],
    });

    return groupedData.map((item) => ({
      year: item.year,
      quarter: item.quarter,
      price: item._avg.price,
    }));
  }
  return await dbModel.findMany({
    where: queryParams,
    orderBy: orderBy,
  });
}
async function formatHistoryData(prices, rates) {
  return prices.map((priceData) => {
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
      price: Number(parseFloat(rawPrice).toFixed(2)),
      interestRate: rawRate,
    };
  });
}

// Test raportu json /api/export/json?cityId=1&marketType=pierwotny&priceType=transakcyjne&yearStart=2018&yearEnd=2020  - 1 miasto, 1 rynek, 1 typ ceny
// test wszystko /api/export/json?yearStart=2018&yearEnd=2020
// JEŻELI JEST WYBRANA OPCJA OBA RYNKI LUB OBIE CENY LUB WSZYSTKIE MIASTA - NIE PODAWAĆ TEJ WARTOŚCI W FILTRZE
//, verifyToken, requireOwnerOrAdmin
router.get("/json", async (req, res) => {
  try {
    const validation = exportSchema.safeParse(req.query);
    if (!validation.success) {
      const errors = validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        code: issue.code,
      }));
      return res.status(400).json({ success: false, errors });
    }
    const { cityId, marketType, priceType, yearStart, yearEnd } =
      validation.data;
    const city = cityId
      ? await prisma.city.findUnique({ where: { id: cityId } })
      : null;
    const cityName = city?.name || "Wszystkie miasta";
    let average = false;
    if (!marketType || !priceType || !cityId) {
      average = true;
    }
    const prices = await getTableData("housingPrice", {
      queryParams: {
        cityId,
        marketType,
        priceType,
        year: { gte: yearStart, lte: yearEnd },
      },
      orderBy: [{ year: "asc" }, { quarter: "asc" }],
      averageByQuarter: average,
    });
    const rates = await getTableData("interestRate", {
      queryParams: {
        rateType: "ref",
        // validFrom: {
        //   gte: new Date(Date.UTC(yearStart, 0, 1)),
        //   lt: new Date(Date.UTC(yearEnd, 12, 1)),
        // },
      },
      orderBy: [{ validFrom: "desc" }],
    });
    if (prices.length === 0 || rates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brak danych dla tych filtrów.",
      });
    }
    const history = await formatHistoryData(prices, rates);
    const firstRecord = prices[0];
    const lastRecord = prices[prices.length - 1];
    const responseData = {
      success: true,
      header: {
        description: `Kwartalny raport średnich cen mieszkań na tle referencyjnych stóp procentowych NBP.`,
        generatedAt: new Date().toISOString(),
        filtersApplied: {
          city: cityName,
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
    };
    const jsonString = JSON.stringify(responseData, null, 2);
    const dateString = new Date().toISOString().split("T")[0];
    const filename = `raport_mieszkaniowy_${dateString}.json`;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(jsonString);
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
      const errors = validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        code: issue.code,
      }));
      return res.status(400).json({ success: false, errors });
    }
    const { cityId, marketType, priceType, yearStart, yearEnd } =
      validation.data;
    const city = cityId
      ? await prisma.city.findUnique({ where: { id: cityId } })
      : null;
    const cityName = city?.name || "Wszystkie miasta";
    let average = false;
    if (!marketType || !priceType || !cityId) {
      average = true;
    }
    const prices = await getTableData("housingPrice", {
      queryParams: {
        cityId,
        marketType,
        priceType,
        year: { gte: yearStart, lte: yearEnd },
      },
      orderBy: [{ year: "asc" }, { quarter: "asc" }],
      averageByQuarter: average,
    });
    const rates = await getTableData("interestRate", {
      queryParams: {
        rateType: "ref",
      },
      orderBy: [{ validFrom: "desc" }],
    });
    if (prices.length === 0 || rates.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Brak danych dla tych filtrów.",
      });
    }
    const history = await formatHistoryData(prices, rates);
    const firstRecord = prices[0];
    const lastRecord = prices[prices.length - 1];
    const reportData = {
      success: true,
      header: {
        description: `Kwartalny raport średnich cen mieszkań na tle referencyjnych stóp procentowych NBP.`,
        generatedAt: new Date().toISOString(),
        filtersApplied: {
          city: cityName,
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
    };
    const yamlString = yaml.stringify(reportData);
    const dateString = new Date().toISOString().split("T")[0];
    const filename = `raport_mieszkaniowy_${dateString}.yaml`;
    res.setHeader("Content-Type", "application/x-yaml");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(yamlString);
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
