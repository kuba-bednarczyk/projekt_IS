import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MarketTypePricesChart from "@/components/charts/MarketTypePricesChart";

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