import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const TopCitiesCard = ({ data, endYear }) => (
  <Card className="flex flex-col">
    <CardHeader>
      <CardTitle className="text-lg font-semibold">Najszybciej rosnące rynki ({endYear})</CardTitle>
      <CardDescription>5 miast w których ceny najbardziej wzrosły r/r.</CardDescription>
    </CardHeader>
    <CardContent className="flex-1">
      <div className="space-y-4">
        {data?.length > 0 ? data.map((city, i) => (
          <div key={i} className="flex justify-between items-center border-b border-zinc-100 pb-2 last:border-0">
            <div>
              <p className="font-semibold text-zinc-800">{i + 1}. {city.name}</p>
              <p className="text-xs text-zinc-500">{Math.round(city.currentPrice).toLocaleString("pl-PL")} zł/m²</p>
            </div>
            <div className={`font-bold ${city.growth > 0 ? "text-emerald-600" : "text-red-600"}`}>
              {city.growth > 0 ? "+" : ""}{city.growth.toFixed(1)}%
            </div>
          </div>
        )) : <p className="text-sm text-zinc-500 text-center py-4">Brak danych porównawczych.</p>}
      </div>
    </CardContent>
  </Card>
);