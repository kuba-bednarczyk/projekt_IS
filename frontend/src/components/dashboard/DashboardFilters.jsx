import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const DashboardFilters = ({ filters, ranges, cities }) => {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Filtry danych</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Górny rząd: Miasto, Rynek, Rodzaj ceny */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Miasto</label>
            <select
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
              value={filters.selectedCity}
              onChange={(e) => filters.setSelectedCity(e.target.value)}
            >
              <option value="all">Wszystkie miasta</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Rynek</label>
            <select
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
              value={filters.selectedMarket}
              onChange={(e) => filters.setSelectedMarket(e.target.value)}
            >
              <option value="all">Wszystkie</option>
              <option value="pierwotny">Pierwotny</option>
              <option value="wtórny">Wtórny</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Rodzaj ceny</label>
            <select
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
              value={filters.selectedPriceType}
              onChange={(e) => filters.setSelectedPriceType(e.target.value)}
            >
              <option value="all">Wszystkie</option>
              <option value="ofertowe">Ofertowe</option>
              <option value="transakcyjne">Transakcyjne</option>
            </select>
          </div>
        </div>

        {/* Dolny rząd: Zakresy dat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-100">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Rok od</label>
            <select
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
              value={filters.yearFrom}
              onChange={(e) => filters.setYearFrom(e.target.value)}
            >
              {ranges.availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Kwartał od</label>
            <select
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
              value={filters.quarterFrom}
              onChange={(e) => filters.setQuarterFrom(e.target.value)}
            >
              {ranges.quartersForFromYear.map((q) => (
                <option key={q} value={q}>Q{q}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Rok do</label>
            <select
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
              value={filters.yearTo}
              onChange={(e) => filters.setYearTo(e.target.value)}
            >
              {ranges.availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Kwartał do</label>
            <select
              className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm"
              value={filters.quarterTo}
              onChange={(e) => filters.setQuarterTo(e.target.value)}
            >
              {ranges.quartersForToYear.map((q) => (
                <option key={q} value={q}>Q{q}</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardFilters;