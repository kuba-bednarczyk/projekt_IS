import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// pomocnicze do waliddacji dat
const periodToIndex = (year, quarter) => Number(year) * 4 + Number(quarter);
const indexToPeriod = (index) => ({
  year: Math.floor((index - 1) / 4),
  quarter: ((index - 1) % 4) + 1,
});

//startowe wartości filtrów czasu
const DEFAULT_YEAR_FROM = "2016";
const DEAFULT_Q_FROM = "1";

export const useDashboardData = () => {
  const navigate = useNavigate();

  // Stany bazowe (API)
  const [cities, setCities] = useState([]);
  const [prices, setPrices] = useState([]);
  const [rates, setRates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stany filtrów
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [selectedPriceType, setSelectedPriceType] = useState("all");

  const [yearFrom, setYearFrom] = useState(DEFAULT_YEAR_FROM);
  const [quarterFrom, setQuarterFrom] = useState(DEAFULT_Q_FROM);
  const [yearTo, setYearTo] = useState("");
  const [quarterTo, setQuarterTo] = useState("");

  // fetch danych z API
  useEffect(() => {
    const fetchAllData = async () => {
      if (!localStorage.getItem("isAuthenticated")) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const fetchOptions = {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        };

        const [citiesRes, pricesRes, ratesRes] = await Promise.all([
          fetch(`${API_URL}/cities`, fetchOptions),
          fetch(`${API_URL}/prices`, fetchOptions),
          fetch(`${API_URL}/rates`, fetchOptions),
        ]);

        if (citiesRes.status === 401 || citiesRes.status === 403) {
          localStorage.removeItem("isAuthenticated");
          navigate("/", { replace: true });
          return;
        }

        const [citiesData, pricesData, ratesData] = await Promise.all([
          citiesRes.json(),
          pricesRes.json(),
          ratesRes.json(),
        ]);

        const years = [...new Set(pricesData.map((p) => p.year))].sort((a, b) => a - b);
        if (years.length > 0) {
          const startY = years.includes(2016) ? 2016 : years[0];
          const endY = years[years.length - 1];

          const startQuarters = [...new Set(pricesData.filter((p) => p.year === startY).map((p) => p.quarter))].sort((a, b) => a - b);
          const endQuarters = [...new Set(pricesData.filter((p) => p.year === endY).map((p) => p.quarter))].sort((a, b) => a - b);

          setYearFrom(String(startY));
          setQuarterFrom(String(startQuarters[0]));
          setYearTo(String(endY));
          setQuarterTo(String(endQuarters[endQuarters.length - 1]));
        }

        setCities(citiesData);
        setPrices(pricesData);
        setRates(ratesData);
        setIsLoading(false);
      } catch (err) {
        console.error("Błąd pobierania:", err);
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [navigate]);

  // edge case'y (dostepne zakresy)
  const availableYears = useMemo(() => {
    if (prices.length === 0) return [];
    return [...new Set(prices.map((p) => p.year))].sort((a, b) => a - b);
  }, [prices]);

  const getAvailableQuartersForYear = useCallback((year) => {
    if (!year || prices.length === 0) return [];
    const pricesForYear = prices.filter((p) => p.year === Number(year));
    return [...new Set(pricesForYear.map((p) => p.quarter))].sort((a, b) => a - b);
  }, [prices]);

  // kontroler zakresow: minimum 4 kwartały przerwy
  const applyRangeConstraints = useCallback((newYF, newQF, newYT, newQT, sideChanged) => {
    if (prices.length === 0) return;

    let yF = Number(newYF);
    let qF = Number(newQF);
    let yT = Number(newYT);
    let qT = Number(newQT);

    // Ochrona przed nieistniejącymi kwartałami
    const validFromQs = getAvailableQuartersForYear(yF);
    if (validFromQs.length > 0 && !validFromQs.includes(qF)) {
      qF = sideChanged === "from" ? validFromQs[0] : validFromQs[validFromQs.length - 1];
    }
    
    const validToQs = getAvailableQuartersForYear(yT);
    if (validToQs.length > 0 && !validToQs.includes(qT)) {
      qT = sideChanged === "to" ? validToQs[validToQs.length - 1] : validToQs[0];
    }

    let fromIdx = periodToIndex(yF, qF);
    let toIdx = periodToIndex(yT, qT);
    const MIN_GAP = 4; // minimalna liczba przerwy między kwartałami

    // Wymuszony dystanst
    if (toIdx - fromIdx < MIN_GAP) {
      if (sideChanged === "from") {
        toIdx = fromIdx + MIN_GAP; // uciekamy prawym "suwakiem" w prawo
      } else {
        fromIdx = toIdx - MIN_GAP; // uciekamy lewym "suwakiem" w lewo
      }
    }

    //Sprawdzanie granic absolutnych (żeby zakres nie wyszedł poza bazę danych)
    const minYear = availableYears[0];
    const minQ = Math.min(...prices.filter((p) => p.year === minYear).map((p) => p.quarter));
    const maxYear = availableYears[availableYears.length - 1];
    const maxQ = Math.max(...prices.filter((p) => p.year === maxYear).map((p) => p.quarter));

    const absMinIdx = periodToIndex(minYear, minQ);
    const absMaxIdx = periodToIndex(maxYear, maxQ);

    if (toIdx > absMaxIdx) {
      toIdx = absMaxIdx;
      fromIdx = Math.max(absMinIdx, toIdx - MIN_GAP);
    }
    if (fromIdx < absMinIdx) {
      fromIdx = absMinIdx;
      toIdx = Math.min(absMaxIdx, fromIdx + MIN_GAP);
    }

    // zapis zaktualizowanych danych 
    const finalFrom = indexToPeriod(fromIdx);
    const finalTo = indexToPeriod(toIdx);

    setYearFrom(String(finalFrom.year));
    setQuarterFrom(String(finalFrom.quarter));
    setYearTo(String(finalTo.year));
    setQuarterTo(String(finalTo.quarter));
  }, [prices, availableYears, getAvailableQuartersForYear]);

  // Wrappery na funkcje ustawiające z DashboardFilters
  const setSafeYearFrom = (val) => applyRangeConstraints(val, quarterFrom, yearTo, quarterTo, "from");
  const setSafeQuarterFrom = (val) => applyRangeConstraints(yearFrom, val, yearTo, quarterTo, "from");
  const setSafeYearTo = (val) => applyRangeConstraints(yearFrom, quarterFrom, val, quarterTo, "to");
  const setSafeQuarterTo = (val) => applyRangeConstraints(yearFrom, quarterFrom, yearTo, val, "to");

  return {
    data: { cities, prices, rates, isLoading },
    filters: {
      selectedCity, setSelectedCity,
      selectedMarket, setSelectedMarket,
      selectedPriceType, setSelectedPriceType,
      yearFrom, setYearFrom: setSafeYearFrom,
      quarterFrom, setQuarterFrom: setSafeQuarterFrom,
      yearTo, setYearTo: setSafeYearTo,
      quarterTo, setQuarterTo: setSafeQuarterTo,
    },
    ranges: {
      availableYears,
      quartersForFromYear: getAvailableQuartersForYear(yearFrom),
      quartersForToYear: getAvailableQuartersForYear(yearTo),
    }
  };
};