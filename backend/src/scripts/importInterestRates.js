async function importInterestRates(parsedData) {
  console.log("Importowanie stóp🦶");
  require("dotenv").config();
  //   const fs = require("fs");
  const { XMLParser } = require("fast-xml-parser");
  const prisma = require("./config/db");
  // Konfiguracja parsera do id dodajemy @_
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  // Zamiana na ZAWSZE tablicę
  const toArray = (val) => (Array.isArray(val) ? val : val ? [val] : []);

  // Zamiana kwartalnego ID (np. "I 2020") na obiekt { year: 2020, quarter: 1 }
  function parseQuarter(idString) {
    const [q, yearStr] = idString.split(" ");
    const year = parseInt(yearStr, 10);
    let quarter = 1;
    if (q === "II") quarter = 2;
    if (q === "III") quarter = 3;
    if (q === "IV") quarter = 4;
    return { year, quarter };
  }

  //   console.log("Importowanie stóp procentowych.");
  //   const xmlData = fs.readFileSync("data/stopy_procentowe.xml", "utf-8");
  //   const jsonObj = parser.parse(xmlData);

  const pozycjeZDatami = toArray(parsedData.stopy_procentowe_archiwum.pozycje);
  const dataToInsert = [];

  for (const grupa of pozycjeZDatami) {
    //odczytanie tylko potrzebnych dat (poprzez pominiecie niepotrzebnych)
    const dateStr = grupa["@_obowiazuje_od"];
    if (dateStr < "2014-10-09") {
      continue;
    }
    if (dateStr === "2026-03-05") {
      continue;
    }
    //zamiana na format daty
    const validFrom = new Date(grupa["@_obowiazuje_od"]);
    const stopy = toArray(grupa.pozycja);

    for (const stopa of stopy) {
      dataToInsert.push({
        validFrom: validFrom,
        rateType: stopa["@_id"],
        // Zamiana przecinka na kropkę tak aby po otrzymaniu stringa prisma zamieni na decimal
        rateValue: stopa["@_oprocentowanie"].replace(",", "."),
      });
    }
  }

  // Wrzucamy wszystko do bazy za jednym zamachem (bardzo wydajne)
  const result = await prisma.interestRate.createMany({
    data: dataToInsert,
    skipDuplicates: true,
  });

  console.log(`Dodano ${result.count} wpisów stóp procentowych.`);
}
module.exports = { importInterestRates };
