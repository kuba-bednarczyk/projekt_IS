import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";

import Header from "@/components/Header";

import HeroMarketStats from "@/components/HeroMarketStats";
import PriceTrendChart from "@/components/PriceTrendChart";
import CityPriceChart from "@/components/CityPriceChart";
import MarketTypePricesChart from "@/components/MarketTypePricesChart";

import {
  CardTitle,
  Card,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const periodToIndex = (year, quarter) => year * 4 + quarter;
const quarterEndDate = (year, quarter) =>
  new Date(Date.UTC(year, quarter * 3, 0, 23, 59, 59));
const indexToPeriod = (index) => ({
  year: Math.floor((index - 1) / 4),
  quarter: ((index - 1) % 4) + 1,
});

const DEFAULT_FROM_YEAR = 2014;
const DEFAULT_TO_YEAR = 2024;

const Dashboard = () => {
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [prices, setPrices] = useState([]);
  const [rates, setRates] = useState([]);

  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [selectedPriceType, setSelectedPriceType] = useState("ofertowe");

  const [yearFrom, setYearFrom] = useState("2014");
  const [quarterFrom, setQuarterFrom] = useState("1");
  const [yearTo, setYearTo] = useState("2024");
  const [quarterTo, setQuarterTo] = useState("4");

  useEffect(() => {
    const fetchAllData = async () => {
      if (!localStorage.getItem("isAuthenticated")) {
        navigate("/", { replace: true });
        return;
      }

      const headers = {
        "Content-Type": "application/json",
      };
      const fetchOptions = { headers, credentials: "include" };

      try {
        const [citiesRes, pricesRes, ratesRes] = await Promise.all([
          fetch("http://localhost:3000/api/cities", fetchOptions),
          fetch("http://localhost:3000/api/prices", fetchOptions),
          fetch("http://localhost:3000/api/rates", fetchOptions),
        ]);

        const responses = [citiesRes, pricesRes, ratesRes];

        for (const res of responses) {
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              localStorage.removeItem("isAuthenticated");
              navigate("/", { replace: true });
              return;
            }

            const errorBody = await res.json().catch(() => null);
            throw new Error(
              errorBody?.message || `Błąd serwera: ${res.status}`,
            );
          }
        }

        const [citiesData, pricesData, ratesData] = await Promise.all(
          responses.map((res) => res.json()),
        );

        setCities(citiesData);
        setPrices(pricesData);
        setRates(ratesData);
      } catch (err) {
        console.error("Błąd pobierania:", err);
      }
    };

    fetchAllData();
  }, [navigate]);

  // funkcja do pobierania dostępnych lat z bazy danych
  const availableYears = useMemo(() => {
    const years = new Set(prices.map((p) => p.year));
    return [...years].sort((a, b) => a - b);
  }, [prices]);

  // funkcja do pobierania domyślnego roku "od" z bazy danych
  const fallbackFromYear = useMemo(() => {
    if (availableYears.length === 0) return DEFAULT_FROM_YEAR;
    return availableYears.includes(DEFAULT_FROM_YEAR)
      ? DEFAULT_FROM_YEAR
      : availableYears[0];
  }, [availableYears]);

  // funkcja do pobierania domyślnego roku "do" z bazy danych
  const fallbackToYear = useMemo(() => {
    if (availableYears.length === 0) return DEFAULT_TO_YEAR;
    return availableYears.includes(DEFAULT_TO_YEAR)
      ? DEFAULT_TO_YEAR
      : availableYears[availableYears.length - 1];
  }, [availableYears]);

  // zmienne pomocnicze do zabezpieczenia wybranego roku przed niezgodnością z bazą danych
  const resolvedYearFrom = availableYears.includes(Number(yearFrom))
    ? yearFrom
    : String(fallbackFromYear);
  const resolvedYearTo = availableYears.includes(Number(yearTo))
    ? yearTo
    : String(fallbackToYear);

  const applyRangeConstraints = useCallback(
    (nextFromYear, nextFromQuarter, nextToYear, nextToQuarter, changedSide) => {
      if (availableYears.length === 0) {
        return {
          fromYear: String(nextFromYear),
          fromQuarter: String(nextFromQuarter),
          toYear: String(nextToYear),
          toQuarter: String(nextToQuarter),
        };
      }

      const minIndex = periodToIndex(availableYears[0], 1);
      const maxIndex = periodToIndex(
        availableYears[availableYears.length - 1],
        4,
      );
      const minSpan = Math.min(3, Math.max(0, maxIndex - minIndex));

      let fromIndex = periodToIndex(
        Number(nextFromYear),
        Number(nextFromQuarter),
      );
      let toIndex = periodToIndex(Number(nextToYear), Number(nextToQuarter));

      if (changedSide === "from") {
        toIndex = Math.max(toIndex, fromIndex + minSpan);
      } else {
        fromIndex = Math.min(fromIndex, toIndex - minSpan);
      }

      fromIndex = Math.max(minIndex, fromIndex);
      toIndex = Math.min(maxIndex, toIndex);

      if (toIndex - fromIndex < minSpan) {
        if (changedSide === "from") {
          toIndex = Math.min(maxIndex, fromIndex + minSpan);
          fromIndex = Math.max(minIndex, toIndex - minSpan);
        } else {
          fromIndex = Math.max(minIndex, toIndex - minSpan);
          toIndex = Math.min(maxIndex, fromIndex + minSpan);
        }
      }

      const fromPeriod = indexToPeriod(fromIndex);
      const toPeriod = indexToPeriod(toIndex);

      return {
        fromYear: String(fromPeriod.year),
        fromQuarter: String(fromPeriod.quarter),
        toYear: String(toPeriod.year),
        toQuarter: String(toPeriod.quarter),
      };
    },
    [availableYears],
  );

  const handleFromYearChange = (value) => {
    const constrained = applyRangeConstraints(
      value,
      quarterFrom,
      resolvedYearTo,
      quarterTo,
      "from",
    );
    setYearFrom(constrained.fromYear);
    setQuarterFrom(constrained.fromQuarter);
    setYearTo(constrained.toYear);
    setQuarterTo(constrained.toQuarter);
  };

  const handleFromQuarterChange = (value) => {
    const constrained = applyRangeConstraints(
      resolvedYearFrom,
      value,
      resolvedYearTo,
      quarterTo,
      "from",
    );
    setYearFrom(constrained.fromYear);
    setQuarterFrom(constrained.fromQuarter);
    setYearTo(constrained.toYear);
    setQuarterTo(constrained.toQuarter);
  };

  const handleToYearChange = (value) => {
    const constrained = applyRangeConstraints(
      resolvedYearFrom,
      quarterFrom,
      value,
      quarterTo,
      "to",
    );
    setYearFrom(constrained.fromYear);
    setQuarterFrom(constrained.fromQuarter);
    setYearTo(constrained.toYear);
    setQuarterTo(constrained.toQuarter);
  };

  const handleToQuarterChange = (value) => {
    const constrained = applyRangeConstraints(
      resolvedYearFrom,
      quarterFrom,
      resolvedYearTo,
      value,
      "to",
    );
    setYearFrom(constrained.fromYear);
    setQuarterFrom(constrained.fromQuarter);
    setYearTo(constrained.toYear);
    setQuarterTo(constrained.toQuarter);
  };

  // funkcja do pobierania zakresu lat z bazy danych
  const selectedRange = useMemo(() => {
    if (availableYears.length === 0) return null;

    const startYear = Number(resolvedYearFrom);
    const startQuarter = Number(quarterFrom);
    const endYear = Number(resolvedYearTo);
    const endQuarter = Number(quarterTo);

    const fromIndex = periodToIndex(startYear, startQuarter);
    const toIndex = periodToIndex(endYear, endQuarter);

    return {
      startYear,
      startQuarter,
      endYear,
      endQuarter,
      startIndex: fromIndex,
      endIndex: toIndex,
    };
  }, [
    availableYears,
    resolvedYearFrom,
    quarterFrom,
    resolvedYearTo,
    quarterTo,
  ]);

  // callback: do zapamiętania tej samej referencji między renderami dopoki nie zmieni się selectedRange
  const isInSelectedRange = useCallback(
    (year, quarter) => {
      if (!selectedRange) return true;
      const idx = periodToIndex(year, quarter);
      return idx >= selectedRange.startIndex && idx <= selectedRange.endIndex;
    },
    [selectedRange],
  );

  // funkcja do liczenia statystyk
  const stats = useMemo(() => {
    if (prices.length === 0 || !selectedRange) return null;

    const getBaseFilteredPrices = ({ year = null, withinRange = true } = {}) =>
      prices.filter((p) => {
        const matchYear = year ? p.year === year : true;
        const matchRange = withinRange
          ? isInSelectedRange(p.year, p.quarter)
          : true;
        const matchCity =
          selectedCity === "all" ? true : p.cityId === parseInt(selectedCity);
        const matchMarket =
          selectedMarket === "all" ? true : p.marketType === selectedMarket;
        const matchPriceType =
          selectedPriceType === "all"
            ? true
            : p.priceType === selectedPriceType;
        return (
          matchYear && matchRange && matchCity && matchMarket && matchPriceType
        );
      });

    const calcAvg = (arr) => {
      if (arr.length === 0) return 0;
      const sum = arr.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
      return sum / arr.length;
    };

    const latestYearInRange = selectedRange.endYear;
    const previousYear = latestYearInRange - 1;
    const fiveYearsBack = latestYearInRange - 5;

    const avgLatestYear = calcAvg(
      getBaseFilteredPrices({ year: latestYearInRange, withinRange: true }),
    );
    const avgPreviousYear = calcAvg(
      getBaseFilteredPrices({ year: previousYear, withinRange: false }),
    );
    const avgFiveYearsBack = calcAvg(
      getBaseFilteredPrices({ year: fiveYearsBack, withinRange: false }),
    );

    const rrGrowth =
      avgPreviousYear > 0
        ? ((avgLatestYear - avgPreviousYear) / avgPreviousYear) * 100
        : 0;
    const growth5Y =
      avgFiveYearsBack > 0
        ? ((avgLatestYear - avgFiveYearsBack) / avgFiveYearsBack) * 100
        : 0;

    const latestRate = [...rates]
      .filter(
        (r) =>
          new Date(r.validFrom) <=
          quarterEndDate(selectedRange.endYear, selectedRange.endQuarter),
      )
      .sort(
        (a, b) =>
          new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime(),
      )[0];

    const spreadPrices = prices.filter(
      (p) =>
        p.year === latestYearInRange &&
        (selectedCity === "all" ? true : p.cityId === parseInt(selectedCity)) &&
        (selectedMarket === "all" ? true : p.marketType === selectedMarket),
    );

    const avgOfertowe = calcAvg(
      spreadPrices.filter((p) => p.priceType === "ofertowe"),
    );
    const avgTransakcyjne = calcAvg(
      spreadPrices.filter((p) => p.priceType === "transakcyjne"),
    );
    const spread =
      avgTransakcyjne > 0
        ? ((avgOfertowe - avgTransakcyjne) / avgTransakcyjne) * 100
        : 0;

    return {
      avgPriceLabel: `Śr. cena/m² (${latestYearInRange})`,
      avgPrice:
        avgLatestYear > 0
          ? `${Math.round(avgLatestYear).toLocaleString("pl-PL")} zł`
          : "Brak",
      rrGrowth,
      growth5Y:
        growth5Y !== 0
          ? `${growth5Y > 0 ? "+" : ""}${Math.round(growth5Y)}%`
          : "Brak",
      growth5YRangeLabel: `${fiveYearsBack} → ${latestYearInRange}`,
      latestRateValue: latestRate
        ? `${parseFloat(latestRate.rateValue).toLocaleString("pl-PL")}%`
        : "Brak",
      latestRateDate: latestRate
        ? new Date(latestRate.validFrom).toLocaleDateString("pl-PL", {
            month: "short",
            year: "numeric",
          })
        : "",
      spread: spread !== 0 ? `${spread.toFixed(1).replace(".", ",")}%` : "Brak",
      spreadLabel: `Spread of./trans. (${latestYearInRange})`,
      marketRangeLabel: `${selectedRange.startYear} Q${selectedRange.startQuarter} - ${selectedRange.endYear} Q${selectedRange.endQuarter}`,
    };
  }, [
    prices,
    rates,
    selectedCity,
    selectedMarket,
    selectedPriceType,
    selectedRange,
    isInSelectedRange,
  ]);

  // dane do wykresu trendu cen vs stopa NBP
  const pricesAndRatesData = useMemo(() => {
    if (
      !selectedRange ||
      prices.length === 0 ||
      rates.length === 0 ||
      availableYears.length === 0
    ) {
      return [];
    }

    const data = [];
    const minYear = availableYears[0];
    const maxYear = availableYears[availableYears.length - 1];

    for (let year = minYear; year <= maxYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        if (!isInSelectedRange(year, quarter)) continue;

        const quarterPrices = prices.filter((p) => {
          const matchYear = p.year === year;
          const matchQuarter = p.quarter === quarter;
          const matchCity =
            selectedCity === "all" ? true : p.cityId === parseInt(selectedCity);
          const matchMarket =
            selectedMarket === "all" ? true : p.marketType === selectedMarket;
          const matchPriceType =
            selectedPriceType === "all"
              ? true
              : p.priceType === selectedPriceType;
          return (
            matchYear &&
            matchQuarter &&
            matchCity &&
            matchMarket &&
            matchPriceType
          );
        });

        const avgPrice =
          quarterPrices.length > 0
            ? quarterPrices.reduce((sum, p) => sum + parseFloat(p.price), 0) /
              quarterPrices.length
            : null;

        const rateForQuarter = rates
          .filter((r) => new Date(r.validFrom) <= quarterEndDate(year, quarter))
          .sort(
            (a, b) =>
              new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime(),
          )[0];

        const avgRate = rateForQuarter
          ? parseFloat(rateForQuarter.rateValue)
          : null;

        if (avgPrice !== null && avgRate !== null) {
          data.push({
            period: `${year} Q${quarter}`,
            avgPrice: Math.round(avgPrice),
            avgRate,
          });
        }
      }
    }

    return data;
  }, [
    prices,
    rates,
    selectedCity,
    selectedMarket,
    selectedPriceType,
    selectedRange,
    availableYears,
    isInSelectedRange,
  ]);

  // dane do wykresu porównania miast
  const cityComparisonData = useMemo(() => {
    if (prices.length === 0 || cities.length === 0 || !selectedRange) return [];
    const latestYearInRange = selectedRange.endYear;

    return cities
      .map((city) => {
        const cityPrices = prices.filter((p) => {
          const matchCity = p.cityId === city.id;
          const matchYear = p.year === latestYearInRange;
          const matchMarket =
            selectedMarket === "all" ? true : p.marketType === selectedMarket;
          const matchPriceType =
            selectedPriceType === "all"
              ? true
              : p.priceType === selectedPriceType;
          return matchCity && matchYear && matchMarket && matchPriceType;
        });

        const avgPrice =
          cityPrices.length > 0
            ? cityPrices.reduce((sum, p) => sum + parseFloat(p.price), 0) /
              cityPrices.length
            : 0;

        return {
          name: city.name,
          avgPrice: Math.round(avgPrice),
        };
      })
      .filter((item) => item.avgPrice > 0);
  }, [cities, prices, selectedMarket, selectedPriceType, selectedRange]);

  // dane do wykresu porównania rynku pierwotnego i wtórnego
  const marketTypeComparisonData = useMemo(() => {
    if (!selectedRange || prices.length === 0 || availableYears.length === 0)
      return [];

    const data = [];
    const minYear = availableYears[0];
    const maxYear = availableYears[availableYears.length - 1];

    for (let year = minYear; year <= maxYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        if (!isInSelectedRange(year, quarter)) continue;

        const filteredPrices = prices.filter((p) => {
          const matchYear = p.year === year;
          const matchQuarter = p.quarter === quarter;
          const matchCity =
            selectedCity === "all" ? true : p.cityId === parseInt(selectedCity);
          const matchPriceType =
            selectedPriceType === "all"
              ? true
              : p.priceType === selectedPriceType;
          return matchYear && matchQuarter && matchCity && matchPriceType;
        });

        const pierwotnyPrices = filteredPrices.filter(
          (p) => p.marketType === "pierwotny",
        );
        const wtornyPrices = filteredPrices.filter(
          (p) => p.marketType === "wtórny",
        );

        const calcAvg = (arr) => {
          if (arr.length === 0) return null;
          const sum = arr.reduce(
            (acc, curr) => acc + parseFloat(curr.price),
            0,
          );
          return Math.round(sum / arr.length);
        };

        const avgPierwotny = calcAvg(pierwotnyPrices);
        const avgWtorny = calcAvg(wtornyPrices);

        if (avgPierwotny !== null || avgWtorny !== null) {
          data.push({
            period: `${year} Q${quarter}`,
            pierwotny: avgPierwotny || 0,
            wtorny: avgWtorny || 0,
          });
        }
      }
    }

    return data;
  }, [
    prices,
    selectedCity,
    selectedPriceType,
    selectedRange,
    availableYears,
    isInSelectedRange,
  ]);

  // handler do eksportu przefiltrowanych danych do formatu json/yaml
  const handleDataExport = async (format) => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedCity !== "all") queryParams.append("cityId", selectedCity);
      if (selectedMarket !== "all")
        queryParams.append("marketType", selectedMarket);
      if (selectedPriceType !== "all")
        queryParams.append("priceType", selectedPriceType);
      queryParams.append("yearStart", resolvedYearFrom);
      queryParams.append("yearEnd", resolvedYearTo);

      const url = `http://localhost:3000/api/export/${format}?${queryParams.toString()}`;

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Błąd podczas eksportu do ${format.toUpperCase()}`,
        );
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      const contentDisposition = res.headers.get("Content-Disposition");
      let fileName = `raport_mieszkaniowy.${format}`;
      if (contentDisposition && contentDisposition.includes("attachment")) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1])
          fileName = matches[1].replace(/['"]/g, "");
      }

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Filtry danych
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Miasto
                </label>
                <select
                  className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="all">Wszystkie miasta</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Rynek
                </label>
                <select
                  className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                >
                  <option value="all">Wszystkie</option>
                  <option value="pierwotny">Pierwotny</option>
                  <option value="wtórny">Wtórny</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Rodzaj ceny
                </label>
                <select
                  className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
                  value={selectedPriceType}
                  onChange={(e) => setSelectedPriceType(e.target.value)}
                >
                  <option value="all">Wszystkie</option>
                  <option value="ofertowe">Ofertowe</option>
                  <option value="transakcyjne">Transakcyjne</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-100">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Rok od
                </label>
                <select
                  className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
                  value={resolvedYearFrom}
                  onChange={(e) => handleFromYearChange(e.target.value)}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Kwartał od
                </label>
                <select
                  className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
                  value={quarterFrom}
                  onChange={(e) => handleFromQuarterChange(e.target.value)}
                >
                  <option value="1">Q1</option>
                  <option value="2">Q2</option>
                  <option value="3">Q3</option>
                  <option value="4">Q4</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Rok do
                </label>
                <select
                  className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
                  value={resolvedYearTo}
                  onChange={(e) => handleToYearChange(e.target.value)}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Kwartał do
                </label>
                <select
                  className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
                  value={quarterTo}
                  onChange={(e) => handleToQuarterChange(e.target.value)}
                >
                  <option value="1">Q1</option>
                  <option value="2">Q2</option>
                  <option value="3">Q3</option>
                  <option value="4">Q4</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <HeroMarketStats
          cities={cities}
          stats={stats}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          selectedMarket={selectedMarket}
          setSelectedMarket={setSelectedMarket}
          selectedPriceType={selectedPriceType}
          setSelectedPriceType={setSelectedPriceType}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Trend cen vs Stopa NBP (
              {stats?.marketRangeLabel || "zakres danych"})
            </CardTitle>
            <CardDescription>
              Oś lewa: średnia cena zł/m² · Oś prawa: stopa procentowa %
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <PriceTrendChart data={pricesAndRatesData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Porównanie miast (
              {selectedRange ? selectedRange.endYear : "rok końcowy"})
            </CardTitle>
            <CardDescription>
              Średnia cena/m² wg aktywnych filtrów
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <CityPriceChart data={cityComparisonData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Rynek Pierwotny vs Wtórny
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <MarketTypePricesChart data={marketTypeComparisonData} />
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 pb-12">
          <Button
            className="bg-red-600"
            onClick={() => alert("Eksport do PDF - funkcja w przygotowaniu!")}
          >
            Eksport do PDF
          </Button>
          <Button className="bg-yellow-400" onClick={() => handleDataExport("json")}>Eksport do JSON</Button>
          <Button className="bg-cyan-600" onClick={() => handleDataExport("yaml")}>Eksport do YAML</Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
