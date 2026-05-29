import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import PriceTrendChart from "@/components/PriceTrendChart";
import CityPriceChart from "@/components/CityPriceChart";
import MarketTypePricesChart from "@/components/MarketTypePricesChart";

export const PriceTrendCard = ({ data, rangeLabel }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">
        Trend cen vs Stopa NBP ({rangeLabel || "zakres danych"})
      </CardTitle>
      <CardDescription>
        Oś lewa: średnia cena zł/m² · Oś prawa: stopa procentowa %
      </CardDescription>
    </CardHeader>
    <CardContent className="pb-6">
      <PriceTrendChart data={data} />
    </CardContent>
  </Card>
);

export const CityComparisonCard = ({ data, endYear }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">
        Porównanie miast ({endYear || "rok końcowy"})
      </CardTitle>
      <CardDescription>
        Średnia cena/m² wg aktywnych filtrów
      </CardDescription>
    </CardHeader>
    <CardContent className="pb-6">
      <CityPriceChart data={data} />
    </CardContent>
  </Card>
);

export const MarketTypeCard = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">
        Rynek Pierwotny vs Wtórny
      </CardTitle>
    </CardHeader>
    <CardContent className="pb-6">
      <MarketTypePricesChart data={data} />
    </CardContent>
  </Card>
);