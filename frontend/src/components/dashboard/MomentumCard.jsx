import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import MomentumChart from "@/components/charts/MomentumChart";

export const MomentumCard = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">Momentum Rynku (% r/r)</CardTitle>
      <CardDescription>Dynamika zmian cen kwartał do kwartału rok wcześniej</CardDescription>
    </CardHeader>
    <CardContent className="pb-6 h-80">
      <MomentumChart data={data} />
    </CardContent>
  </Card>
);