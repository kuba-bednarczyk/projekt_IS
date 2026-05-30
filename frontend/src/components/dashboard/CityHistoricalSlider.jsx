import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const CityHistoricalSlider = ({ data, endYear }) => (
  <div className="w-full">
    <h3 className="text-lg font-bold text-zinc-900 mb-4 px-1">Lokalne trendy historyczne (Ceny średnioroczne zł/m²)</h3>
    <div className="flex overflow-x-auto gap-4 pt-2 px-2 pb-4 snap-x snap-mandatory hide-scrollbar">
      {data?.map((city, index) => (
        <Card key={index} className="min-w-55 snap-center shrink-0 border-zinc-200 shadow-sm">
          <CardHeader className="p-4 pb-2 bg-zinc-50/50 border-b border-zinc-100 rounded-t-xl">
            <CardTitle className="text-base text-center text-zinc-800">{city.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{endYear}:</span>
              <span className="font-bold text-zinc-900">{Math.round(city.currentYear).toLocaleString()} zł</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{endYear - 1}:</span>
              <span className="font-medium text-zinc-700">{city.prev1Year ? Math.round(city.prev1Year).toLocaleString() + " zł" : "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{endYear - 2}:</span>
              <span className="font-medium text-zinc-700">{city.prev2Year ? Math.round(city.prev2Year).toLocaleString() + " zł" : "-"}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);