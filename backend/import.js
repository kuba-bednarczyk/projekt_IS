require("dotenv").config();
const fs = require("fs");
const { XMLParser } = require("fast-xml-parser");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("./src/generated/prisma");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
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

async function importInterestRates() {
  console.log("Importowanie stóp procentowych.");
  const xmlData = fs.readFileSync("data/stopy_procentowe.xml", "utf-8");
  const jsonObj = parser.parse(xmlData);

  const pozycjeZDatami = toArray(jsonObj.stopy_procentowe_archiwum.pozycje);
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

async function importHousingPrices() {
  console.log("Importowanie cen mieszkań.");
  const xmlData = fs.readFileSync("data/ceny_mieszkan_kwartalne.xml", "utf-8");
  const jsonObj = parser.parse(xmlData);

  const kwartaly = toArray(jsonObj.ceny_mieszkan.Kwartal);
  const cenyWszystkie = [];
  const unikalneMiasta = new Set(); //slownik miast

  const kategorie = [
    "pierwotny_ofertowe",
    "pierwotny_transakcyjne",
    "wtorny_ofertowe",
    "wtorny_transakcyjne",
  ];

  for (const kwartal of kwartaly) {
    const { year, quarter } = parseQuarter(kwartal["@_id"]);

    for (const kategoria of kategorie) {
      if (kwartal[kategoria] && kwartal[kategoria].pozycja) {
        const pozycje = toArray(kwartal[kategoria].pozycja);

        const marketType = kategoria.includes("pierwotny")
          ? "pierwotny"
          : "wtórny";
        const priceType = kategoria.includes("ofertowe")
          ? "ofertowe"
          : "transakcyjne";

        for (const poz of pozycje) {
          const cityName = poz["@_id"];
          unikalneMiasta.add(cityName);

          cenyWszystkie.push({
            cityName,
            year,
            quarter,
            marketType,
            priceType,
            price: poz["@_cena"].replace(",", "."),
          });
        }
      }
    }
  }

  console.log(`Tworzenie słownika miast (${unikalneMiasta.size} miast)`);
  for (const miasto of unikalneMiasta) {
    await prisma.city.upsert({
      where: { name: miasto },
      update: {},
      create: { name: miasto },
    });
  }

  // Pobieramy ID miast z bazy żeby połączyć je z cenami
  const wszystkieMiastaZBazy = await prisma.city.findMany();
  const mapaMiast = {};
  wszystkieMiastaZBazy.forEach((m) => (mapaMiast[m.name] = m.id));

  //Podmieniamy nazwy miast na cityId w zebranych cenach
  const daneDoWstawienia = cenyWszystkie.map((cena) => ({
    cityId: mapaMiast[cena.cityName],
    year: cena.year,
    quarter: cena.quarter,
    marketType: cena.marketType,
    priceType: cena.priceType,
    price: cena.price,
  }));

  //Dodajemy ceny do bazy
  const result = await prisma.housingPrice.createMany({
    data: daneDoWstawienia,
    skipDuplicates: true,
  });

  console.log(`Dodano ${result.count} wpisów z cenami mieszkań.`);
}

async function main() {
  try {
    await importInterestRates();
    await importHousingPrices();
    console.log("Cały import zakończył się sukcesem!");
  } catch (error) {
    console.error("Wystąpił błąd podczas importu:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
