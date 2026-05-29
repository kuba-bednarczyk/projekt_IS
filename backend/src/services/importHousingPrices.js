const prisma = require("../config/db");
async function importHousingPrices(parsedData) {
  console.log("Importowanie cen mieszkań.");

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
  const kwartaly = parsedData.ceny_mieszkan.Kwartal;
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
      const pozycje = kwartal[kategoria].pozycja;

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
module.exports = { importHousingPrices };
