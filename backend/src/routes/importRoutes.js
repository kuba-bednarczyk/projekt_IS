const express = require("express");
const prisma = require("../config/db");
const router = express.Router();
const multer = require("multer");
const { verifyToken, requireRole } = require("../middleware/auth");
const { importHousingPrices } = require("../services/importHousingPrices.js");
const { importInterestRates } = require("../services/importInterestRates.js");
const upload = multer({ storage: multer.memoryStorage() });
const { ratesSchema, pricesSchema } = require("../validations/importSchemas");
const { XMLParser } = require("fast-xml-parser");
const parse = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});
router.post( "/", verifyToken, requireRole("ADMIN"),
  upload.fields([
    { name: "prices", maxCount: 1 },
    { name: "rates", maxCount: 1 },
  ]),
  async (req, res) => {
    const prices = req.files?.["prices"]?.[0];
    const rates = req.files?.["rates"]?.[0];

    if (!prices && !rates) {
      return res.status(400).json({ error: "No files received" });
    }

    try {
      let cleanPricesData = null;
      let cleanRatesData = null;

      if (prices) {
        const xmlString = prices.buffer.toString("utf-8");
        const rawParsedObject = parse.parse(xmlString);
        const validatedPrices = pricesSchema.safeParse(rawParsedObject);

        if (!validatedPrices.success) {
          const errors = validatedPrices.error.issues.map((issue) => ({
            field: issue.path.join("."),
            code: issue.code,
          }));
          return res.status(400).json({ success: false, errors });
        }
        cleanPricesData = validatedPrices.data;
      }

      if (rates) {
        const xmlStringr = rates.buffer.toString("utf-8");
        const rawParsedObjectr = parse.parse(xmlStringr);
        const validatedRates = ratesSchema.safeParse(rawParsedObjectr);

        if (!validatedRates.success) {
          const errors = validatedRates.error.issues.map((issue) => ({
            field: issue.path.join("."),
            code: issue.code,
          }));
          return res.status(400).json({ success: false, errors });
        }
        cleanRatesData = validatedRates.data;
      }
      const tasks = [];
      if (cleanPricesData) tasks.push(importHousingPrices(cleanPricesData));
      if (cleanRatesData) tasks.push(importInterestRates(cleanRatesData));
      await Promise.all(tasks);

      return res.status(200).json({ message: "ok" });
    } catch (err) {
      console.error("Endpoint Error:", err);
      return res.status(500).json({ error: err.message });
    }
  },
);
router.delete("/rates", verifyToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const ratesCount = await prisma.interestRate.count();
    await prisma.$executeRaw`TRUNCATE TABLE "InterestRate" RESTART IDENTITY CASCADE;`;
    return res.status(200).json({
      message: "Successfully deleted all interest rate data.",
      count: ratesCount,
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error occurred while deleting the interest rates.",
    });
  }
});

router.delete("/cities", verifyToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const cityCount = await prisma.city.count();
    const housingCount = await prisma.housingPrice.count();
    await prisma.$executeRaw`TRUNCATE TABLE "City" RESTART IDENTITY CASCADE;`;
    return res.status(200).json({
      message: "Successfully deleted all city data",
      deletedRecords: {
        cities: cityCount,
        housingPrices: housingCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: "An error occurred while deleting the city data.",
    });
  }
});
module.exports = router;
