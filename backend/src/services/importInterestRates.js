const { Prisma } = require("../generated/prisma");
const prisma = require("../config/db");

async function importInterestRates(parsedData) {
  console.log("Importowanie stóp procentowych");
  const pozycjeZDatami = parsedData.stopy_procentowe_archiwum.pozycje;

  const ratesByType = {};

  for (const grupa of pozycjeZDatami) {
    const validFrom = new Date(grupa["@_obowiazuje_od"]);

    for (const stopa of grupa.pozycja) {
      const rateId = stopa["@_id"];

      if (!ratesByType[rateId]) {
        ratesByType[rateId] = [];
      }

      ratesByType[rateId].push({
        validFrom: validFrom,
        rateValue: stopa["@_oprocentowanie"].replace(",", "."),
      });
    }
  }

  const dataToInsert = [];

  for (const [rateType, ratesArray] of Object.entries(ratesByType)) {
    ratesArray.sort((a, b) => a.validFrom - b.validFrom);

    for (let i = 0; i < ratesArray.length; i++) {
      const currentRate = ratesArray[i];

      let sum = new Prisma.Decimal(currentRate.rateValue);
      let count = 1;
      let j = i + 1;
      while (
        j < ratesArray.length &&
        ratesArray[j].validFrom.getFullYear() ===
          currentRate.validFrom.getFullYear() &&
        ratesArray[j].validFrom.getMonth() === currentRate.validFrom.getMonth()
      ) {
        sum = sum.plus(ratesArray[j].rateValue);
        count++;
        j++;
      }
      const averageRateValue = sum.dividedBy(count).toFixed(2);
      i = j - 1;

      const nextRate = ratesArray[i + 1];

      let iterDate = new Date(
        Date.UTC(
          currentRate.validFrom.getFullYear(),
          currentRate.validFrom.getMonth(),
          1,
        ),
      );

      let endDate;
      if (nextRate) {
        endDate = new Date(
          Date.UTC(
            nextRate.validFrom.getFullYear(),
            nextRate.validFrom.getMonth(),
            1,
          ),
        );
      } else {
        const today = new Date();
        endDate = new Date(
          Date.UTC(today.getFullYear(), today.getMonth() + 1, 1),
        );
      }

      while (iterDate < endDate) {
        dataToInsert.push({
          validFrom: new Date(iterDate),
          rateType: rateType,
          rateValue: averageRateValue,
        });

        iterDate.setUTCMonth(iterDate.getMonth() + 1);
      }
    }
  }

  if (dataToInsert.length > 0) {
    const result = await prisma.interestRate.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });
    console.log(
      `Dodano ${result.count} znormalizowanych, miesięcznych wpisów stóp procentowych (wszystkie typy).`,
    );
  } else {
    console.log("Nie znaleziono żadnych stóp do dodania.");
  }
}

module.exports = { importInterestRates };
