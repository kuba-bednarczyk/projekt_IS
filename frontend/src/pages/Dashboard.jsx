import Header from "@/components/layout/Header";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import HeroMarketStats from "@/components/dashboard/HeroMarketStats";
import { PriceTrendCard } from "@/components/dashboard/PriceTrendCard";
import { CityComparisonCard } from "@/components/dashboard/CityComparisonCard";
import { MarketTypeCard } from "@/components/dashboard/MarketTypeCard";
import { MomentumCard } from "@/components/dashboard/MomentumCard";
import { TopCitiesCard } from "@/components/dashboard/TopCitiesCard";
import { CityHistoricalSlider } from "@/components/dashboard/CityHistoricalSlider";

import { Button } from "@/components/ui/button";

import { useDashboardData } from "@/hooks/useDashboardData";
import { useDashboardMath } from "@/hooks/useDashboardMath";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const Dashboard = () => {
  const { data, filters, ranges } = useDashboardData();
  const mathData = useDashboardMath(data, filters, ranges);

  const handleDataExport = async (format) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.selectedCity !== "all")
        queryParams.append("cityId", filters.selectedCity);
      if (filters.selectedMarket !== "all")
        queryParams.append("marketType", filters.selectedMarket);
      if (filters.selectedPriceType !== "all")
        queryParams.append("priceType", filters.selectedPriceType);
      queryParams.append("yearStart", filters.yearFrom);
      queryParams.append("yearEnd", filters.yearTo);

      const res = await fetch(
        `${API_URL}/export/${format}?${queryParams.toString()}`,
        { credentials: "include" },
      );
      if (!res.ok)
        throw new Error(`Błąd podczas eksportu do ${format.toUpperCase()}`);

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `raport_mieszkaniowy.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert(err.message);
    }
  };

  if (data.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Ładowanie danych...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Header />
      <main className="max-w-350 mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <DashboardFilters
          filters={filters}
          ranges={ranges}
          cities={data.cities}
        />
        <HeroMarketStats stats={mathData.stats} />
        <PriceTrendCard
          data={mathData.pricesAndRatesData}
          rangeLabel={mathData.stats?.marketRangeLabel}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopCitiesCard
            data={mathData.topCitiesYy}
            endYear={mathData.selectedRange?.endYear}
          />
          <div className="lg:col-span-2">
            <MomentumCard data={mathData.momentumData} />
          </div>
        </div>
        <CityComparisonCard
          data={mathData.cityComparisonData}
          endYear={mathData.selectedRange?.endYear}
        />
        <MarketTypeCard data={mathData.marketTypeComparisonData} />
        <div className="pt-4 border-t border-zinc-200 mt-8">
          <CityHistoricalSlider
            data={mathData.citySliderData}
            endYear={mathData.selectedRange?.endYear}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 pb-12">
          <Button
            variant="outline"
            className="bg-amber-400 text-zinc-100 hover:bg-amber-500 hover:text-white border-none"
            onClick={() => handleDataExport("json")}
          >
            Pobierz JSON
          </Button>
          <Button
            variant="outline"
            className="bg-green-500 text-zinc-100 hover:bg-green-600 hover:text-white border-none"
            onClick={() => handleDataExport("yaml")}
          >
            Pobierz YAML
          </Button>
          <Button
            variant="outline"
            className="bg-blue-600 text-zinc-100 hover:bg-blue-700 hover:text-white border-none"
            onClick={() => handleDataExport("xml")}
          >
            Pobierz XML
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
