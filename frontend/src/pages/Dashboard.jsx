import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";

import Header from "@/components/Header";
import HeroMarketStats from "@/components/dashboard/HeroMarketStats";
import PriceTrendChart from "@/components/dashboard/PriceTrendChart";
import CityPriceComparisonChart from "@/components/dashboard/CityPriceComparisonChart";

import {
  CardTitle,
  Card,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [prices, setPrices] = useState([]);
  const [rates, setRates] = useState([]);

  // selects
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedMarket, setSelectedMarket] = useState("all");
  const [selectedPriceType, setSelectedPriceType] = useState("ofertowe");

  useEffect(() => {
    //fetchowanie potrzebnych danych do dashboardu
    const fetchAllData = async () => {
      // sprawdzanie tokena (autoryzacja)
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/", { replace: true });
        return;
      }
      // zmienna naglowka w ktorej zawieramy bearer
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        // pobieramy dane z backendu
        const [citiesRes, pricesRes, ratesRes] = await Promise.all([
          fetch("http://localhost:3000/api/cities", { headers }),
          fetch("http://localhost:3000/api/prices", { headers }),
          fetch("http://localhost:3000/api/rates", { headers }),
        ]);

        const responses = [citiesRes, pricesRes, ratesRes];

        // jezeli ktorakolwiek odpowiedz jest nieprawidlowa - wylogowujemy uzytkownika
        for (const res of responses) {
          if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
              localStorage.removeItem("token");
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

  // dane do Hero - statystyk ogolnych
  const stats = useMemo(() => {
    if (prices.length === 0) return null;

    // filtry cen, typu rynku i ofert - po danym roku
    const getBaseFilteredPrices = (year) => {
      return prices.filter((p) => {
        const matchYear = year ? p.year === year : true;
        const matchCity =
          selectedCity === "all" ? true : p.cityId === parseInt(selectedCity);
        const matchMarket =
          selectedMarket === "all" ? true : p.marketType === selectedMarket;
        const matchPriceType =
          selectedPriceType === "all"
            ? true
            : p.priceType === selectedPriceType;

        return matchYear && matchCity && matchMarket && matchPriceType;
      });
    };

    // funkcja pomocnicza: obliczanie sredniej
    const calcAvg = (arr) => {
      if (arr.length === 0) return 0;

      const sum = arr.reduce((acc, curr) => acc + parseFloat(curr.price), 0);
      return sum / arr.length;
    };

    // 1. Śr. cena/m² (2024)
    const prices2024 = getBaseFilteredPrices(2024);
    const avg2024 = calcAvg(prices2024);

    // Wzrost r/r (2024 vs 2023) do zielonej strzałki
    const prices2023 = getBaseFilteredPrices(2023);
    const avg2023 = calcAvg(prices2023);
    let rrGrowth = 0;

    if (avg2023 > 0) {
      rrGrowth = ((avg2024 - avg2023) / avg2023) * 100;
    }

    // 2. Wzrost 5-letni (2019 -> 2024)
    const prices2019 = getBaseFilteredPrices(2019);
    const avg2019 = calcAvg(prices2019);
    let growth5Y = 0;
    if (avg2019 > 0) {
      growth5Y = ((avg2024 - avg2019) / avg2019) * 100;
    }

    // 3. Stopa ref. NBP
    const latestRate = rates.length > 0 ? rates[rates.length - 1] : null;

    // 4. Spread of./trans. (Tylko dla 2024)
    const spreadPrices2024 = prices.filter(
      (p) =>
        p.year === 2024 &&
        (selectedCity === "all" ? true : p.cityId === parseInt(selectedCity)) &&
        (selectedMarket === "all" ? true : p.marketType === selectedMarket),
    );

    const avgOfertowe = calcAvg(
      spreadPrices2024.filter((p) => p.priceType === "ofertowe"),
    );
    const avgTransakcyjne = calcAvg(
      spreadPrices2024.filter((p) => p.priceType === "transakcyjne"),
    );

    let spread = 0;
    if (avgTransakcyjne > 0) {
      spread = ((avgOfertowe - avgTransakcyjne) / avgTransakcyjne) * 100;
    }

    return {
      avg2024:
        avg2024 > 0
          ? `${Math.round(avg2024).toLocaleString("pl-PL")} zł`
          : "Brak",
      rrGrowth: rrGrowth,
      growth5Y:
        growth5Y !== 0
          ? `${growth5Y > 0 ? "+" : ""}${Math.round(growth5Y)}%`
          : "Brak",
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
    };
  }, [prices, rates, selectedCity, selectedMarket, selectedPriceType]);

  // Dane do wykresu trendu cen vs stopy ref.
  const pricesAndRatesData = useMemo(() => {
    if (prices.length === 0 || rates.length === 0) return [];

    const data = [];

    // Iterujemy po latach 2015-2024 i kwartałach 1-4
    for (let year = 2015; year <= 2024; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        // Filtrujemy ceny dla danego kwartału i filtrów
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

        // Obliczamy średnią cenę
        const avgPrice =
          quarterPrices.length > 0
            ? quarterPrices.reduce((sum, p) => sum + parseFloat(p.price), 0) /
              quarterPrices.length
            : null;

        // Pobieramy stopę procentową dla konca kwartału
        const quarterEndMonth = quarter * 3;
        const quarterEndDate = new Date(
          Date.UTC(year, quarterEndMonth, 0, 23, 59, 59),
        );

        const rateForQuarter = rates
          .filter((r) => new Date(r.validFrom) <= quarterEndDate)
          .sort(
            (a, b) =>
              new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime(),
          )[0];

        const avgRate = rateForQuarter
          ? parseFloat(rateForQuarter.rateValue)
          : null;

        // Dodajemy do danych wykresu tylko jeśli mamy cenę
        if (avgPrice !== null && avgRate !== null) {
          data.push({
            period: `${year} Q${quarter}`,
            avgPrice: Math.round(avgPrice),
            avgRate: avgRate,
          });
        }
      }
    }

    return data;
  }, [prices, rates, selectedCity, selectedMarket, selectedPriceType]);

  // Dane do porównania miast (rok 2024)
  const cityComparisonData = useMemo(() => {
    if (prices.length === 0 || cities.length === 0) return [];

    return cities
      .map((city) => {
        const cityPrices = prices.filter((p) => {
          const matchCity = p.cityId === city.id;
          const matchYear = p.year === 2024;
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
  }, [cities, prices, selectedMarket, selectedPriceType]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Hero: statystyki - cena (2024), wzorst ceny 5-lat, stopa procentowa (latest), stosunek: ofertowe/transakcyjne */}
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

        {/* Wykres trendu */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Trend cen vs Stopa NBP (2015–2024)
            </CardTitle>
            <CardDescription>
              Oś lewa: średnia cena zł/m² · Oś prawa: stopa procentowa %
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <PriceTrendChart data={pricesAndRatesData} />
          </CardContent>
        </Card>

        {/* Wykres porownania miast */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Porównanie miast (2024)
            </CardTitle>
            <CardDescription>
              Średnia cena/m² wg aktywnych filtrów
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <CityPriceComparisonChart data={cityComparisonData} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
