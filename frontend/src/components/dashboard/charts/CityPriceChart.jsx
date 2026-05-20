import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CityPriceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-center">
        <p className="text-zinc-500">Brak danych do wyświetlenia</p>
      </div>
    );
  }

  // Sortowanie danych od najwyższej ceny
  const sortedData = [...data].sort((a, b) => b.avgPrice - a.avgPrice);

  return (
    <div className="w-full h-80 bg-zinc-50 rounded-lg border border-zinc-200 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e4e4e7"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke="#71717a"
            style={{ fontSize: "12px" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#71717a"
            style={{ fontSize: "12px" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value} zł`}
          />
          <Tooltip
            cursor={{ fill: "#f4f4f5" }}
            contentStyle={{
              backgroundColor: "#fafafa",
              border: "1px solid #e4e4e7",
              borderRadius: "6px",
            }}
            formatter={(value) => [
              `${value.toLocaleString("pl-PL")} zł`,
              "Śr. cena/m²",
            ]}
          />
          <Bar dataKey="avgPrice" radius={[4, 4, 0, 0]} barSize={40}>
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={index === 0 ? "#3b82f6" : "#94a3b8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CityPriceChart;
