import React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const HeroSection = ({
  cities,
  stats,
  selectedCity,
  setSelectedCity,
  selectedMarket,
  setSelectedMarket,
  selectedPriceType,
  setSelectedPriceType,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 space-y-0">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            Rynek nieruchomości{" "}
            <span className="text-muted-foreground font-normal">· 2015–2024</span>
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            Ceny mieszkań na tle stóp procentowych NBP
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            className="flex h-9 w-full sm:w-48 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

          <select
            className="flex h-9 w-full sm:w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
          >
            <option value="all">Oba rynki</option>
            <option value="pierwotny">Pierwotny</option>
            <option value="wtórny">Wtórny</option>
          </select>

          <select
            className="flex h-9 w-full sm:w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={selectedPriceType}
            onChange={(e) => setSelectedPriceType(e.target.value)}
          >
            <option value="all">Wszystkie ceny</option>
            <option value="ofertowe">Ofertowe</option>
            <option value="transakcyjne">Transakcyjne</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Kafelek 1: Średnia cena */}
          <Card className="bg-muted/40 border-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">
                Śr. cena/m² (2024)
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {stats?.avg2024 || "---"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {stats && stats.rrGrowth !== 0 && (
                <span
                  className={`text-xs font-medium ${stats.rrGrowth > 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {stats.rrGrowth > 0 ? "▲" : "▼"}{" "}
                  {Math.abs(stats.rrGrowth).toFixed(1)}% r/r
                </span>
              )}
            </CardContent>
          </Card>

          {/* Kafelek 2: Wzrost 5-letni */}
          <Card className="bg-muted/40 border-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">
                Wzrost 5-letni
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {stats?.growth5Y || "---"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">2019 → 2024</p>
            </CardContent>
          </Card>

          {/* Kafelek 3: Stopa referencyjna */}
          <Card className="bg-muted/40 border-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">
                Stopa ref. NBP
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {stats?.latestRateValue || "---"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">
                od {stats?.latestRateDate || "---"}
              </p>
            </CardContent>
          </Card>

          {/* Kafelek 4: Spread */}
          <Card className="bg-muted/40 border-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">
                Spread of./trans.
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {stats?.spread || "---"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">ofertowe vs transakcyjne</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroSection;
