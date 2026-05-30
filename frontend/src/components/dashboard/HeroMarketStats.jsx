import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const HeroMarketStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          Pulpit analityczny <span className="text-muted-foreground font-normal">· {stats.marketRangeLabel}</span>
        </CardTitle>
        <CardDescription className="text-sm">
          Najważniejsze wskaźniki rynkowe na podstawie wybranych filtrów
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Kafelek 1: Średnia cena */}
          <Card className="bg-muted/30 border-none shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                Śr. cena/m² <span className="font-bold text-zinc-400">{stats.currentPeriodLabel}</span>
              </CardDescription>
              <CardTitle className="text-2xl font-bold">{stats.avgPrice}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {stats.rrGrowth !== 0 && (
                <span className={`text-xs font-bold ${stats.rrGrowth > 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {stats.rrGrowth > 0 ? "▲" : "▼"} {Math.abs(stats.rrGrowth).toFixed(1)}% rok do roku
                </span>
              )}
            </CardContent>
          </Card>

          {/* Kafelek 2: Stopa NBP */}
          <Card className="bg-muted/30 border-none shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                Stopa ref. NBP <span className="font-bold text-zinc-400">{stats.currentPeriodLabel}</span>
              </CardDescription>
              <CardTitle className="text-2xl font-bold">{stats.latestRateValue}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs font-medium text-zinc-500">od {stats.latestRateDate}</p>
            </CardContent>
          </Card>

          {/* Kafelek 3: Wzrost 5-letni */}
          <Card className="bg-muted/30 border-none shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                Wzrost 5-letni
              </CardDescription>
              <CardTitle className="text-2xl font-bold">{stats.growth5Y}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs font-medium text-zinc-500">{stats.growth5YRangeLabel}</p>
            </CardContent>
          </Card>

          {/* Kafelek 4: Rozstrzał of./trans. */}
          <Card className="bg-muted/30 border-none shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                Rozstrzał of./trans. <span className="font-bold text-zinc-400">{stats.currentPeriodLabel}</span>
              </CardDescription>
              <CardTitle className="text-2xl font-bold">{stats.spread}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs font-medium text-zinc-500">Przestrzeń do negocjacji</p>
            </CardContent>
          </Card>

          {/* Kafelek 5: Wartość 50m2 */}
          <Card className="bg-muted/40 border-none shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                Wartość mieszkania (50m²) <span className="font-bold text-zinc-400">{stats.currentPeriodLabel}</span>
              </CardDescription>
              <CardTitle className="text-2xl font-bold">{stats.apartmentValue}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs font-medium text-zinc-500">
                Wg aktualnej średniej ceny
              </p>
            </CardContent>
          </Card>

          {/* Kafelek 6: Szacunkowa Rata */}
          <Card className="bg-muted/40 border-none shadow-none">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-semibold uppercase text-zinc-500 tracking-wider">
                Szacunkowa Rata <span className="font-bold text-zinc-400">{stats.currentPeriodLabel}</span>
              </CardDescription>
              <CardTitle className="text-2xl font-bold">{stats.estimatedInstallment}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs font-medium text-zinc-500">Wkład 20%, 25 lat, marża 2%</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroMarketStats;