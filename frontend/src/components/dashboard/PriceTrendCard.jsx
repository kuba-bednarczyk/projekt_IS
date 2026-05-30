import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import PriceTrendChart from "@/components/charts/PriceTrendChart";

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