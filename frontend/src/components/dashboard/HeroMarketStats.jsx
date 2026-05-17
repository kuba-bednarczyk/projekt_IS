import React from "react";

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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
      {/* Tytuł i Filtry */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        {/* Tytuły */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            Rynek nieruchomości{" "}
            <span className="text-zinc-400 font-normal">· 2015–2024</span>
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Ceny mieszkań na tle stóp procentowych NBP
          </p>
        </div>

        {/* Filtry */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            className="bg-zinc-50 text-zinc-900 text-sm rounded-lg border border-zinc-200 px-3 py-2 focus:ring-2 focus:ring-zinc-900 focus:outline-none w-full sm:w-48 transition-all"
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
            className="bg-zinc-50 text-zinc-900 text-sm rounded-lg border border-zinc-200 px-3 py-2 focus:ring-2 focus:ring-zinc-900 focus:outline-none w-full sm:w-40 transition-all"
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
          >
            <option value="all">Oba rynki</option>
            <option value="pierwotny">Pierwotny</option>
            <option value="wtórny">Wtórny</option>
          </select>

          <select
            className="bg-zinc-50 text-zinc-900 text-sm rounded-lg border border-zinc-200 px-3 py-2 focus:ring-2 focus:ring-zinc-900 focus:outline-none w-full sm:w-40 transition-all"
            value={selectedPriceType}
            onChange={(e) => setSelectedPriceType(e.target.value)}
          >
            <option value="all">Wszystkie ceny</option>
            <option value="ofertowe">Ofertowe</option>
            <option value="transakcyjne">Transakcyjne</option>
          </select>
        </div>
      </div>

      {/* Statystyki */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kafelek 1: Średnia cena */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-1">
              Śr. cena/m² (2024)
            </p>
            <p className="text-2xl font-bold text-zinc-900">
              {stats?.avg2024 || "---"}
            </p>
          </div>
          <div className="mt-2">
            {stats && stats.rrGrowth !== 0 && (
              <span
                className={`text-xs font-medium ${stats.rrGrowth > 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {stats.rrGrowth > 0 ? "▲" : "▼"}{" "}
                {Math.abs(stats.rrGrowth).toFixed(1)}% r/r
              </span>
            )}
          </div>
        </div>

        {/* Kafelek 2: Wzrost 5-letni */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-1">
              Wzrost 5-letni
            </p>
            <p className="text-2xl font-bold text-zinc-900">
              {stats?.growth5Y || "---"}
            </p>
          </div>
          <p className="text-xs text-zinc-400 mt-2">2019 → 2024</p>
        </div>

        {/* Kafelek 3: Stopa referencyjna */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-1">
              Stopa ref. NBP
            </p>
            <p className="text-2xl font-bold text-zinc-900">
              {stats?.latestRateValue || "---"}
            </p>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            od {stats?.latestRateDate || "---"}
          </p>
        </div>

        {/* Kafelek 4: Spread */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-1">
              Spread of./trans.
            </p>
            <p className="text-2xl font-bold text-zinc-900">
              {stats?.spread || "---"}
            </p>
          </div>
          <p className="text-xs text-zinc-400 mt-2">ofertowe vs transakcyjne</p>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
