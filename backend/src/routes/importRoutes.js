const express = require("express");
const prisma = require("../config/db");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { importHousingPrices } = require("../scripts/importHousingPrices.js");
const { importInterestRates } = require("../scripts/importInterestRates.js");
const upload = multer({ storage: multer.memoryStorage() });
const { ratesSchema, pricesSchema } = require("../validations/importSchemas");
//PYTANIE CZY CHCEMY BOLIDA CZY NIE - IE. CZY CHCEMY ŻEBY PRZYJMOWAŁ ILE CHCE USER MIAST I W/E CZY MA BYC DOKŁADNIE OKREŚLONE (NP ZEBY BYLO TYLE SAMO)
// ZMIENIC TO W SCRIPTS
router.post(
  "/import",
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
        const validatedPrices = importSchema.safeParse(rawParsedObject);

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
      if (cleanPricesData) tasks.push(processprices(cleanPricesData));
      if (cleanRatesData) tasks.push(processFileB(cleanRatesData));
      await Promise.all(tasks);

      return res.status(200).json({ message: "ok" });
    } catch (err) {
      console.error("Endpoint Error:", err);
      return res.status(500).json({ error: err.message });
    }
  },
);
