import Header from "@/components/Header";
import DashboardFilters from "@/components/DashboardFilters";
import HeroMarketStats from "@/components/HeroMarketStats";
import { PriceTrendCard, CityComparisonCard, MarketTypeCard } from "@/components/DashboardCards";
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
      if (filters.selectedCity !== "all") queryParams.append("cityId", filters.selectedCity);
      if (filters.selectedMarket !== "all") queryParams.append("marketType", filters.selectedMarket);
      if (filters.selectedPriceType !== "all") queryParams.append("priceType", filters.selectedPriceType);
      queryParams.append("yearStart", filters.yearFrom);
      queryParams.append("yearEnd", filters.yearTo);

      const res = await fetch(`${API_URL}/export/${format}?${queryParams.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error(`Błąd podczas eksportu do ${format.toUpperCase()}`);

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
    return <div className="min-h-screen flex items-center justify-center">Ładowanie danych...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Filtry */}
        <DashboardFilters 
          filters={filters} 
          ranges={ranges} 
          cities={data.cities} 
        />
        {/* Wykresy */}
        <HeroMarketStats 
          stats={mathData.stats} 
        />
        <PriceTrendCard 
          data={mathData.pricesAndRatesData} 
          rangeLabel={mathData.stats?.marketRangeLabel} 
        />
        <CityComparisonCard 
          data={mathData.cityComparisonData} 
          endYear={mathData.selectedRange?.endYear} 
        />
        <MarketTypeCard 
          data={mathData.marketTypeComparisonData} 
        />

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 pb-12">
          <Button className="bg-yellow-400 text-zinc-900" onClick={() => handleDataExport("json")}>
            Eksport do JSON
          </Button>
          <Button className="bg-cyan-600 text-white" onClick={() => handleDataExport("yaml")}>
            Eksport do YAML
          </Button>
          <Button className="bg-green-600 text-white" onClick={() => handleDataExport("xml")}>
            Eksport do XML
          </Button>
        </div>
        
      </main>
    </div>
  );
};

export default Dashboard;