const express = require("express");
const prisma = require("../config/db");
const router = express.Router();
const {
  pricesSchema,
  ratesSchema,
  calculatorSchema,
} = require("../validations/dataSchemas");

// Pobieranie wszystkich miast (idealne do listy rozwijanej na froncie)
router.get("/cities", async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      orderBy: { name: "asc" }, // Od razu sortujemy alfabetycznie dla wygody
    });
    res.status(200).json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Nie udało się pobrać miast",
    });
  }
});

// Pobieranie cen mieszkań (z opcją filtrowania)
// Filtrowanie po roku, kwartale, typie rynku i typie ceny - dowoli (tzn. same kwartały nie przejdą)
// Przykładowe zapytanie: /api/prices?ystart=2023&qstart=1&yend=2023&qend=4&marketType=pierwotny&priceType=ofertowe - pobierze średnie ceny ofertowe mieszkań na rynku pierwotnym od 1 kwartału 2023 do 4 kwartału 2023
router.get("/prices", async (req, res) => {
  try {
    const validation = pricesSchema.safeParse(req.query);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((issue) => issue.message)
        .join(" | ");
      return res.status(400).json({ success: false, message: errorMessage });
    }
    const {
      ystart: yStart,
      qstart: qStart,
      yend: yEnd,
      qend: qEnd,
      marketType,
      priceType,
    } = validation.data;
    const whereFilter = {};
    if (yStart && yEnd && yStart == yEnd) {
      whereFilter.year = yStart;
      whereFilter.quarter = {
        gte: qStart,
        lte: qEnd,
      };
    } else if (yStart && yEnd && yStart < yEnd) {
      whereFilter.OR = [
        { year: yStart, quarter: { gte: qStart } },
        { year: { gt: yStart, lt: yEnd } },
        { year: yEnd, quarter: { lte: qEnd } },
      ];
    } else if (yStart && !yEnd) {
      whereFilter.OR = [
        { year: yStart, quarter: { gte: qStart } },
        { year: { gt: yStart } },
      ];
    } else if (!yStart && yEnd) {
      whereFilter.OR = [
        { year: { lt: yEnd } },
        { year: yEnd, quarter: { lte: qEnd } },
      ];
    }
    if (marketType) whereFilter.marketType = marketType;
    if (priceType) whereFilter.priceType = priceType;
    const prices = await prisma.housingPrice.findMany({
      where: whereFilter,
      orderBy: [{ year: "asc" }, { quarter: "asc" }],
    });
    res.status(200).json(prices);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Nie udało się pobrać cen mieszkań" });
  }
});

// Zawsze ref, od poczatku miesiaca startowego do konca miesiaca koncowego, jesli podane sa miesiace
// Filtrowanie dowolne (tzn. same miesiące nie przejdą)
// Zakresy dat są włączne
// Przykładowe zapytanie: /api/rates?ystart=2023&mstart=1&yend=2025&mend=11 - pobierze stopy procentowe od 1 stycznia 2023 do 31 listopada 2025
router.get("/rates", async (req, res) => {
  try {
    const validation = ratesSchema.safeParse(req.query);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((issue) => issue.message)
        .join(" | ");
      return res.status(400).json({ success: false, message: errorMessage });
    }
    const { ystart: y, mstart: m, yend: yE, mend: mE } = validation.data;
    const whereFilter = { rateType: "ref" };
    const dateRange = {};
    if (y) {
      dateRange.gte = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    }
    if (yE) {
      dateRange.lte = new Date(Date.UTC(yE, mE, 1, 0, 0, 0));
    }
    if (Object.keys(dateRange).length > 0) {
      whereFilter.validFrom = dateRange;
    }
    const rates = await prisma.interestRate.findMany({
      where: whereFilter,
      orderBy: { validFrom: "asc" },
    });
    res.status(200).json(rates);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Nie udało się pobrać stóp procentowych",
    });
  }
});

// endpoint dla kalkuatora podajemy cityId, year, quarter, area, years, marketType (pierwotny/wtórny) i zwracamy: city, period, totalPropertyValue, interestRateApplied, estimatedMonthlyInstallment
// tesetowe zapytanie: /api/calculator?cityId=1&year=2023&area=50.5&years=25&marketType=pierwotny
router.get("/calculator", async (req, res) => {
  try {
    const validation = calculatorSchema.safeParse(req.query);
    if (!validation.success) {
      const errorMessage = validation.error.issues
        .map((issue) => issue.message)
        .join(" | ");
      return res.status(400).json({ success: false, message: errorMessage });
    }
    const { cityId, year, quarter, area, years, marketType } = validation.data;
    const forcedPriceType = "transakcyjne";
    const forcedRateType = "ref";

    // Nazwa miasta o podanym id
    const cityData = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!cityData) {
      return res.status(404).json({
        success: false,
        message: "Nie znaleziono miasta o podanym ID.",
      });
    }

    // Cena mieszkania
    const priceData = await prisma.housingPrice.findFirst({
      where: {
        cityId: cityId,
        year: year,
        quarter: quarter,
        marketType: { equals: marketType },
        priceType: { equals: forcedPriceType, mode: "insensitive" },
      },
    });

    if (!priceData) {
      return res.status(404).json({
        success: false,
        message: "Brak danych o cenie dla tego kwartału.",
      });
    }

    // Stopa procentowa dla danego kwartału stopa z końca kwartału
    const mEnd = quarter * 3;
    const quarterEndDate = new Date(Date.UTC(year, mEnd, 0, 23, 59, 59));

    // Stopa procentowa to stopa najbliższa do końca kwartału
    const rateData = await prisma.interestRate.findFirst({
      where: {
        rateType: forcedRateType,
        validFrom: { lte: quarterEndDate },
      },
      orderBy: { validFrom: "desc" },
    });

    if (!rateData) {
      return res.status(404).json({
        success: false,
        message: "Brak danych o stopach procentowych dla tego okresu.",
      });
    }

    // obliczenie wartosci mieszkania
    const totalPropertyValue = parseFloat(
      (priceData.price.toNumber() * area).toFixed(2),
    );
    //obliczenie raty miesięcznej
    const annualrate = rateData ? rateData.rateValue.toNumber() : null;
    const r = annualrate / 100 / 12;
    const n = years * 12;
    let monthlyInstallment = 0;
    if (r === 0) {
      monthlyInstallment = parseFloat((totalPropertyValue / n).toFixed(2));
    } else {
      const power = Math.pow(1 + r, n);
      const installment = (totalPropertyValue * r * power) / (power - 1);
      monthlyInstallment = parseFloat(installment.toFixed(2));
    }
    // final reply
    const period = priceData.year + " Q" + priceData.quarter;
    res.status(200).json({
      success: true,
      data: {
        city: cityData.name,
        period: period,
        totalPropertyValue: totalPropertyValue,
        interestRateApplied: rateData.rateValue,
        estimatedMonthlyInstallment: monthlyInstallment,
      },
    });
  } catch (error) {
    console.error("Błąd w endpoint /calculator:", error);
    res
      .status(500)
      .json({ success: false, message: "Wewnętrzny błąd serwera." });
  }
});
module.exports = router;
