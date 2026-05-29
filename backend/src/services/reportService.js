const prisma = require("../config/db");
const { exportSchema } = require("../validations/exportSchemas");
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
async function generateReport(queryParams) {
  const validation = exportSchema.safeParse(queryParams);
  if (!validation.success) {
    const errors = validation.error.issues.map((issue) => ({
      field: issue.path.join("."),
      code: issue.code,
    }));
    return { errorType: "validation", errors };
  }
  const { cityId, marketType, priceType, yearStart, yearEnd } = validation.data;
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
    return { errorType: "notFound", message: "Brak danych dla tych filtrów." };
  }
  const history = await formatHistoryData(prices, rates);
  const firstRecord = prices[0];
  const lastRecord = prices[prices.length - 1];
  const market = marketType ? marketType : "Wtórny i pierwotny";
  const price = priceType ? priceType: "Ofertowe i transakcyjne"
  const responseData = {
    header: {
      description: `Kwartalny raport średnich cen mieszkań na tle referencyjnych stóp procentowych NBP.`,
      generatedAt: new Date().toISOString(),
      filtersApplied: {
        city: cityName,
        marketType: market || null,
        priceType: price || null,
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
  return { success: true, responseData };
}
module.exports = {
  generateReport,
};
