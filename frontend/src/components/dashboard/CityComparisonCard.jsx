import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import CityPriceChart from "@/components/charts/CityPriceChart";

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