const express = require("express");
const router = express.Router();
const yaml = require("yaml");
const { verifyToken, requireOwnerOrAdmin } = require("../middleware/auth");
const { generateReport } = require("../services/reportService");
const { XMLBuilder } = require("fast-xml-parser");

// Test raportu json /api/export/json?cityId=1&marketType=pierwotny&priceType=transakcyjne&yearStart=2018&yearEnd=2020  - 1 miasto, 1 rynek, 1 typ ceny
// test wszystko /api/export/json?yearStart=2018&yearEnd=2020
// JEŻELI JEST WYBRANA OPCJA OBA RYNKI LUB OBIE CENY LUB WSZYSTKIE MIASTA - NIE PODAWAĆ TEJ WARTOŚCI W FILTRZE
router.get("/json", verifyToken, async (req, res) => {
  try {
    const result = await generateReport(req.query);
    if (result.errorType === "validation") {
      return res.status(400).json({ success: false, errors: result.errors });
    }
    if (result.errorType === "notFound") {
      return res.status(404).json({ success: false, message: result.message });
    }
    const jsonString = JSON.stringify(result.responseData, null, 2);
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

router.get("/yaml", verifyToken, async (req, res) => {
  try {
    const result = await generateReport(req.query);
    if (result.errorType === "validation") {
      return res.status(400).json({ success: false, errors: result.errors });
    }
    if (result.errorType === "notFound") {
      return res.status(404).json({ success: false, message: result.message });
    }
    const yamlString = yaml.stringify(result.responseData);
    const dateString = new Date().toISOString().split("T")[0];
    const filename = `raport_mieszkaniowy_${dateString}.yaml`;
    res.setHeader("Content-Type", "application/yaml; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="raport_mieszkaniowy_${dateString}.yaml"; filename*=UTF-8''raport_mieszkaniowy_${dateString}.yaml`,
    );
    return res.status(200).send(yamlString);
  } catch (error) {
    console.error("Błąd w endpoint /yaml:", error);
    res.status(500).json({
      success: false,
      message: "Nie udało się pobrać miast",
    });
  }
});
router.get("/xml", verifyToken, async (req, res) => {
  try {
    const result = await generateReport(req.query);
    if (result.errorType === "validation") {
      return res.status(400).json({ success: false, errors: result.errors });
    }
    if (result.errorType === "notFound") {
      return res.status(404).json({ success: false, message: result.message });
    }
    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      builder.build({ report: result.responseData });
    const dateString = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/xml");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="raport_mieszkaniowy_${dateString}.xml"`,
    );
    return res.status(200).send(xml);
  } catch (error) {
    console.error("Błąd w endpoint /xml:", error);
    res.status(500).json({
      success: false,
      message: "Nie udało się pobrać miast",
    });
  }
});
module.exports = router;
