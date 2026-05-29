import { useMemo, useCallback } from "react";

// funkcje pomocnicze
const periodToIndex = (year, quarter) => year * 4 + quarter;
const quarterEndDate = (year, quarter) => new Date(Date.UTC(year, quarter * 3, 0, 23, 59, 59));

export const useDashboardMath = (data, filters) => {
  const { prices, rates, cities } = data;
  const { selectedCity, selectedMarket, selectedPriceType, yearFrom, quarterFrom, yearTo, quarterTo } = filters;

  // Obliczenie indeksów wybranego zakresu czasowego
  const selectedRange = useMemo(() => {
    if (!yearFrom || !yearTo || !quarterFrom || !quarterTo) return null;
    
    const startYear = Number(yearFrom);
    const startQuarter = Number(quarterFrom);
    const endYear = Number(yearTo);
    const endQuarter = Number(quarterTo);
    
    return {
      startYear,
      startQuarter,
      endYear,
      endQuarter,
      startIndex: periodToIndex(startYear, startQuarter),
      endIndex: periodToIndex(endYear, endQuarter),
    };
  }, [yearFrom, quarterFrom, yearTo, quarterTo]);

  // callback: czy kwartał mieści się w przedziale
  const isInSelectedRange = useCallback((year, quarter) => {
    if (!selectedRange) return true;
    const idx = periodToIndex(year, quarter);
    return idx >= selectedRange.startIndex && idx <= selectedRange.endIndex;
  }, [selectedRange]);

  // filtr: miasto, rynek, typ ceny)
  const isPriceMatchingFilters = useCallback((p) => {
    const matchCity = selectedCity === "all" ? true : p.cityId === parseInt(selectedCity);
    const matchMarket = selectedMarket === "all" ? true : p.marketType === selectedMarket;
    const matchPriceType = selectedPriceType === "all" ? true : p.priceType === selectedPriceType;
    return matchCity && matchMarket && matchPriceType;
  }, [selectedCity, selectedMarket, selectedPriceType]);

  // statystyki 
  const stats = useMemo(() => {
    if (prices.length === 0 || !selectedRange) return null;

    const endY = selectedRange.endYear;
    const endQ = selectedRange.endQuarter;

    // funkcja pobierająca ceny dla KONKRETNEGO kwartału z filtrami
    const getPricesForPeriod = (y, q) => 
      prices.filter((p) => p.year === y && p.quarter === q && isPriceMatchingFilters(p));

    const calcAvg = (arr) => arr.length ? arr.reduce((sum, p) => sum + parseFloat(p.price), 0) / arr.length : 0;

    const avgCurrent = calcAvg(getPricesForPeriod(endY, endQ));
    const avgPreviousYear = calcAvg(getPricesForPeriod(endY - 1, endQ));
    const avg5YearsAgo = calcAvg(getPricesForPeriod(endY - 5, endQ));

    // wzrost jest liczony tylko wtedy gdy mamy aktualne ceny (brak wyjścia poza zakres)
    const rrGrowth = (avgCurrent > 0 && avgPreviousYear > 0) ? ((avgCurrent - avgPreviousYear) / avgPreviousYear) * 100 : 0;
    const growth5Y = (avgCurrent > 0 && avg5YearsAgo > 0) ? ((avgCurrent - avg5YearsAgo) / avg5YearsAgo) * 100 : 0;

    const latestRate = [...rates]
      .filter((r) => new Date(r.validFrom) <= quarterEndDate(endY, endQ))
      .sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime())[0];

    const currentQuarterPrices = prices.filter((p) => p.year === endY && p.quarter === endQ &&
      (selectedCity === "all" ? true : p.cityId === parseInt(selectedCity)) &&
      (selectedMarket === "all" ? true : p.marketType === selectedMarket)
    );

    const avgOfertowe = calcAvg(currentQuarterPrices.filter((p) => p.priceType === "ofertowe"));
    const avgTransakcyjne = calcAvg(currentQuarterPrices.filter((p) => p.priceType === "transakcyjne"));
    
    // liczmy spread tylko jesli mamy ceny ofertowe/transakcyjne
    const spread = (avgOfertowe > 0 && avgTransakcyjne > 0) ? ((avgOfertowe - avgTransakcyjne) / avgTransakcyjne) * 100 : 0;

    return {
      avgPriceLabel: `Śr. cena/m² (Q${endQ} ${endY})`,
      avgPrice: avgCurrent > 0 ? `${Math.round(avgCurrent).toLocaleString("pl-PL")} zł` : "Brak",
      rrGrowth,
      growth5Y: growth5Y !== 0 ? `${growth5Y > 0 ? "+" : ""}${Math.round(growth5Y)}%` : "Brak",
      growth5YRangeLabel: `Q${endQ} ${endY - 5} → Q${endQ} ${endY}`,
      latestRateValue: latestRate ? `${parseFloat(latestRate.rateValue).toLocaleString("pl-PL")}%` : "Brak",
      latestRateDate: latestRate ? new Date(latestRate.validFrom).toLocaleDateString("pl-PL", { month: "short", year: "numeric" }) : "",
      spread: spread !== 0 ? `${spread.toFixed(1).replace(".", ",")}%` : "Brak",
      spreadLabel: `Spread of./trans. (Q${endQ} ${endY})`,
      marketRangeLabel: `${selectedRange.startYear} Q${selectedRange.startQuarter} - ${endY} Q${endQ}`,
    };
  }, [prices, rates, selectedRange, isPriceMatchingFilters, selectedCity, selectedMarket]);

  // ceny vs stopa procentowa
  const pricesAndRatesData = useMemo(() => {
    if (!selectedRange || prices.length === 0 || rates.length === 0) return [];

    const resultData = [];
    for (let year = selectedRange.startYear; year <= selectedRange.endYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        if (!isInSelectedRange(year, quarter)) continue;

        const quarterPrices = prices.filter((p) => p.year === year && p.quarter === quarter && isPriceMatchingFilters(p));
        const avgPrice = quarterPrices.length > 0
          ? quarterPrices.reduce((sum, p) => sum + parseFloat(p.price), 0) / quarterPrices.length
          : null;

        // ostatnia stopa procentowa w danym kwartale
        const rateForQuarter = [...rates]
          .filter((r) => new Date(r.validFrom) <= quarterEndDate(year, quarter))
          .sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime())[0];

        const avgRate = rateForQuarter ? parseFloat(rateForQuarter.rateValue) : null;

        // Jeśli mamy i cenę, i stopę – dodajemy punkt na wykres
        if (avgPrice !== null && avgRate !== null) {
          resultData.push({
            period: `${year} Q${quarter}`,
            avgPrice: Math.round(avgPrice),
            avgRate: Number(avgRate),
          });
        }
      }
    }
    return resultData;
  }, [prices, rates, selectedRange, isInSelectedRange, isPriceMatchingFilters]);

  // Dane dla porównania cen w miastach 
  const cityComparisonData = useMemo(() => {
    if (prices.length === 0 || cities.length === 0 || !selectedRange) return [];
    
    const endY = selectedRange.endYear;
    const endQ = selectedRange.endQuarter;

    return cities.map((city) => {
      const cityPrices = prices.filter((p) => p.cityId === city.id && p.year === endY && p.quarter === endQ &&
        (selectedMarket === "all" ? true : p.marketType === selectedMarket) &&
        (selectedPriceType === "all" ? true : p.priceType === selectedPriceType)
      );

      const avgPrice = cityPrices.length > 0
        ? cityPrices.reduce((sum, p) => sum + parseFloat(p.price), 0) / cityPrices.length
        : 0;

      return { name: city.name, avgPrice: Math.round(avgPrice) };
    }).filter((item) => item.avgPrice > 0).sort((a, b) => b.avgPrice - a.avgPrice);
  }, [cities, prices, selectedRange, selectedMarket, selectedPriceType]);

  // dane dla porównania rynków: pierwotny vs wtórny
  const marketTypeComparisonData = useMemo(() => {
    if (!selectedRange || prices.length === 0) return [];
    
    const resultData = [];
    for (let year = selectedRange.startYear; year <= selectedRange.endYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        if (!isInSelectedRange(year, quarter)) continue;

        const filteredPrices = prices.filter((p) => p.year === year && p.quarter === quarter &&
          (selectedCity === "all" ? true : p.cityId === parseInt(selectedCity)) &&
          (selectedPriceType === "all" ? true : p.priceType === selectedPriceType)
        );

        const pierwotny = filteredPrices.filter((p) => p.marketType === "pierwotny");
        const wtorny = filteredPrices.filter((p) => p.marketType === "wtórny");

        const calcAvg = (arr) => arr.length ? Math.round(arr.reduce((sum, p) => sum + parseFloat(p.price), 0) / arr.length) : null;

        const avgP = calcAvg(pierwotny);
        const avgW = calcAvg(wtorny);

        if (avgP !== null || avgW !== null) {
          resultData.push({
            period: `${year} Q${quarter}`,
            pierwotny: avgP || 0,
            wtorny: avgW || 0,
          });
        }
      }
    }
    return resultData;
  }, [prices, selectedRange, isInSelectedRange, selectedCity, selectedPriceType]);

  return {
    selectedRange,
    stats,
    pricesAndRatesData,
    cityComparisonData,
    marketTypeComparisonData,
  };
};