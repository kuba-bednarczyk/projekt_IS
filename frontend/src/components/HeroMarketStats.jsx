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
            <span className="text-muted-foreground font-normal">
              · {stats?.marketRangeLabel || "zakres danych"}
            </span>
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            Ceny mieszkań na tle stóp procentowych NBP
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Kafelek 1: Średnia cena */}
          <Card className="bg-muted/40 border-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">
                {stats?.avgPriceLabel || "Śr. cena/m²"}
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {stats?.avgPrice || "---"}
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
              <p className="text-xs text-muted-foreground">
                {stats?.growth5YRangeLabel || ""}
              </p>
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
                {stats?.latestRatePrefix || "od"} {stats?.latestRateDate || "---"}
              </p>
            </CardContent>
          </Card>

          {/* Kafelek 4: Spread */}
          <Card className="bg-muted/40 border-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">
                {stats?.spreadLabel || "Spread of./trans."}
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
