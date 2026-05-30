import { useMemo, useCallback } from "react";

const periodToIndex = (year, quarter) => year * 4 + quarter;
const quarterEndDate = (year, quarter) => new Date(Date.UTC(year, quarter * 3, 0, 23, 59, 59));

export const useDashboardMath = (data, filters) => {
  const { prices, rates, cities } = data;
  const { selectedCity, selectedMarket, selectedPriceType, yearFrom, quarterFrom, yearTo, quarterTo } = filters;

  const selectedRange = useMemo(() => {
    if (!yearFrom || !yearTo || !quarterFrom || !quarterTo) return null;
    const startYear = Number(yearFrom), startQuarter = Number(quarterFrom);
    const endYear = Number(yearTo), endQuarter = Number(quarterTo);
    return {
      startYear, startQuarter, endYear, endQuarter,
      startIndex: periodToIndex(startYear, startQuarter),
      endIndex: periodToIndex(endYear, endQuarter),
    };
  }, [yearFrom, quarterFrom, yearTo, quarterTo]);

  const isInSelectedRange = useCallback((year, quarter) => {
    if (!selectedRange) return true;
    const idx = periodToIndex(year, quarter);
    return idx >= selectedRange.startIndex && idx <= selectedRange.endIndex;
  }, [selectedRange]);

  const isPriceMatchingFilters = useCallback((p) => {
    return (selectedCity === "all" ? true : p.cityId === parseInt(selectedCity)) &&
           (selectedMarket === "all" ? true : p.marketType === selectedMarket) &&
           (selectedPriceType === "all" ? true : p.priceType === selectedPriceType);
  }, [selectedCity, selectedMarket, selectedPriceType]);

  // Główny wykres - trend cen vs stopa nbp
  const pricesAndRatesData = useMemo(() => {
    if (!selectedRange || prices.length === 0 || rates.length === 0) return [];
    const resultData = [];
    for (let year = selectedRange.startYear; year <= selectedRange.endYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        if (!isInSelectedRange(year, quarter)) continue;

        const quarterPrices = prices.filter((p) => p.year === year && p.quarter === quarter && isPriceMatchingFilters(p));
        const avgPrice = quarterPrices.length ? quarterPrices.reduce((sum, p) => sum + parseFloat(p.price), 0) / quarterPrices.length : null;

        const rateForQuarter = [...rates]
          .filter((r) => new Date(r.validFrom) <= quarterEndDate(year, quarter))
          .sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime())[0];
        const avgRate = rateForQuarter ? parseFloat(rateForQuarter.rateValue) : null;

        if (avgPrice !== null && avgRate !== null) {
          resultData.push({ period: `${year} Q${quarter}`, year, quarter, avgPrice: Math.round(avgPrice), avgRate: Number(avgRate) });
        }
      }
    }
    return resultData;
  }, [prices, rates, selectedRange, isInSelectedRange, isPriceMatchingFilters]);

// Statystyki do HeroMarketStats
  const stats = useMemo(() => {
    if (prices.length === 0 || !selectedRange) return null;
    const endY = selectedRange.endYear, endQ = selectedRange.endQuarter;
    const getPricesForPeriod = (y, q) => prices.filter((p) => p.year === y && p.quarter === q && isPriceMatchingFilters(p));
    const calcAvg = (arr) => arr.length ? arr.reduce((sum, p) => sum + parseFloat(p.price), 0) / arr.length : 0;

    const avgCurrent = calcAvg(getPricesForPeriod(endY, endQ));
    const avgPreviousYear = calcAvg(getPricesForPeriod(endY - 1, endQ));
    const avg5YearsAgo = calcAvg(getPricesForPeriod(endY - 5, endQ));

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
    const spread = (avgOfertowe > 0 && avgTransakcyjne > 0) ? ((avgOfertowe - avgTransakcyjne) / avgTransakcyjne) * 100 : 0;

    // Perspektywa kupującego: całkowity koszt + rata kredytu
    let apartmentValue = "Brak";
    let estimatedInstallment = "Brak";
    
    if (avgCurrent > 0) {
      const propertyValue = avgCurrent * 50; // Cena za 50m2
      apartmentValue = `${Math.round(propertyValue).toLocaleString("pl-PL")} zł`;
      
      if (latestRate) {
        const loanAmount = propertyValue * 0.8; // Zakładamy 20% wkładu własnego (czyli pożyczamy 80%)
        const annualRate = parseFloat(latestRate.rateValue) + 2.0; // Stopa NBP + 2% marży banku
        const monthlyRate = (annualRate / 100) / 12;
        const months = 25 * 12; // Kredyt na 25 lat
        
        // Klasyczny wzór na ratę równą
        const installment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        estimatedInstallment = `${Math.round(installment).toLocaleString("pl-PL")} zł / m-c`;
      }
    }

    return {
      avgPriceLabel: `Śr. cena/m²`,
      currentPeriodLabel: `(${endY} Q${endQ})`, // DODANE: Uniwersalna etykieta czasu
      avgPrice: avgCurrent > 0 ? `${Math.round(avgCurrent).toLocaleString("pl-PL")} zł` : "Brak",
      rrGrowth,
      growth5Y: growth5Y !== 0 ? `${growth5Y > 0 ? "+" : ""}${Math.round(growth5Y)}%` : "Brak",
      growth5YRangeLabel: `Q${endQ} ${endY - 5} → Q${endQ} ${endY}`,
      latestRateValue: latestRate ? `${parseFloat(latestRate.rateValue).toLocaleString("pl-PL")}%` : "Brak",
      latestRateDate: latestRate ? new Date(latestRate.validFrom).toLocaleDateString("pl-PL", { month: "short", year: "numeric" }) : "",
      spread: spread !== 0 ? `${spread.toFixed(1).replace(".", ",")}%` : "Brak",
      spreadLabel: `Spread of./trans.`,
      marketRangeLabel: `${selectedRange.startYear} Q${selectedRange.startQuarter} - ${endY} Q${endQ}`,
      apartmentValue, 
      estimatedInstallment 
    };
  }, [prices, rates, selectedRange, isPriceMatchingFilters, selectedCity, selectedMarket]);

  // Wykres dynamiki r/r
const momentumData = useMemo(() => {
    return pricesAndRatesData.map((curr) => {
      const pastPrices = prices.filter(p => p.year === curr.year - 1 && p.quarter === curr.quarter && isPriceMatchingFilters(p));
      const pastAvg = pastPrices.length ? pastPrices.reduce((sum, p) => sum + parseFloat(p.price), 0) / pastPrices.length : 0;
      
      const growth = pastAvg > 0 ? ((curr.avgPrice - pastAvg) / pastAvg) * 100 : 0;
      return { period: curr.period, growth: Number(growth.toFixed(1)) };
    }).filter(d => d.growth !== 0); 
  }, [pricesAndRatesData, prices, isPriceMatchingFilters]);

  // Tabela Top 5 wzrostów r/r
  const topCitiesYy = useMemo(() => {
    if (!selectedRange || cities.length === 0) return [];
    const endY = selectedRange.endYear, endQ = selectedRange.endQuarter;
    
    return cities.map(city => {
      const getAvg = (y, q) => {
        const arr = prices.filter(p => p.cityId === city.id && p.year === y && p.quarter === q &&
          (selectedMarket === "all" ? true : p.marketType === selectedMarket) &&
          (selectedPriceType === "all" ? true : p.priceType === selectedPriceType));
        return arr.length ? arr.reduce((sum, p) => sum + parseFloat(p.price), 0) / arr.length : null;
      };
      const curr = getAvg(endY, endQ);
      const past = getAvg(endY - 1, endQ);
      const growth = (curr && past) ? ((curr - past) / past) * 100 : null;
      return { name: city.name, currentPrice: curr, growth };
    })
    .filter(c => c.growth !== null)
    .sort((a, b) => b.growth - a.growth)
    .slice(0, 5); // Pobieramy Top 5
  }, [cities, prices, selectedRange, selectedMarket, selectedPriceType]);

  // slider: średnia z całego roku z ostatnich 3 lat wg. filtru endYear
  const citySliderData = useMemo(() => {
    if (!selectedRange || cities.length === 0) return [];
    const endY = selectedRange.endYear;
    return cities.map(city => {
      const getYearAvg = (y) => {
        const arr = prices.filter(p => p.cityId === city.id && p.year === y &&
          (selectedMarket === "all" ? true : p.marketType === selectedMarket) &&
          (selectedPriceType === "all" ? true : p.priceType === selectedPriceType));
        return arr.length ? arr.reduce((sum, p) => sum + parseFloat(p.price), 0) / arr.length : null;
      };
      return {
        name: city.name,
        currentYear: getYearAvg(endY),
        prev1Year: getYearAvg(endY - 1),
        prev2Year: getYearAvg(endY - 2),
      };
    }).filter(c => c.currentYear !== null);
  }, [cities, prices, selectedRange, selectedMarket, selectedPriceType]);

  const cityComparisonData = useMemo(() => {
    if (!selectedRange) return [];
    const endY = selectedRange.endYear, endQ = selectedRange.endQuarter;
    return cities.map((city) => {
      const cityPrices = prices.filter((p) => p.cityId === city.id && p.year === endY && p.quarter === endQ &&
        (selectedMarket === "all" ? true : p.marketType === selectedMarket) &&
        (selectedPriceType === "all" ? true : p.priceType === selectedPriceType)
      );
      const avgPrice = cityPrices.length > 0 ? cityPrices.reduce((sum, p) => sum + parseFloat(p.price), 0) / cityPrices.length : 0;
      return { name: city.name, avgPrice: Math.round(avgPrice) };
    }).filter((item) => item.avgPrice > 0).sort((a, b) => b.avgPrice - a.avgPrice);
  }, [cities, prices, selectedRange, selectedMarket, selectedPriceType]);

  const marketTypeComparisonData = useMemo(() => {
    if (!selectedRange) return [];
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
        const avgP = calcAvg(pierwotny), avgW = calcAvg(wtorny);
        if (avgP !== null || avgW !== null) resultData.push({ period: `${year} Q${quarter}`, pierwotny: avgP || 0, wtorny: avgW || 0 });
      }
    }
    return resultData;
  }, [prices, selectedRange, isInSelectedRange, selectedCity, selectedPriceType]);

  return {
    selectedRange, stats, pricesAndRatesData, cityComparisonData, marketTypeComparisonData,
    momentumData, topCitiesYy, citySliderData
  };
};