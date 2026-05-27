import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PriceTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-center">
        <p className="text-zinc-500">Brak danych do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-zinc-50 rounded-lg border border-zinc-200 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="period"
            stroke="#71717a"
            style={{ fontSize: "12px" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            stroke="#71717a"
            domain={[(min) => Math.max(0, Math.floor(min / 100) * 100), "auto"]}
            allowDataOverflow={true}
            tickCount={8}
            tickFormatter={(value) => value.toLocaleString("pl-PL")}
            label={{
              value: "Cena/m² (zł)",
              angle: -90,
              position: "insideLeft",
            }}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#71717a"
            domain={["dataMin", "auto"]}
            tickCount={8}
            label={{
              value: "Stopa (%) NBP",
              angle: 90,
              position: "insideRight",
            }}
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fafafa",
              border: "1px solid #e4e4e7",
              borderRadius: "6px",
            }}
            formatter={(value) => {
              if (typeof value === "number") {
                return value.toFixed(2);
              }
              return value;
            }}
            labelStyle={{ color: "#18181b" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgPrice"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Trend cen/m²"
            isAnimationActive={true}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgRate"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="Stopa ref. NBP (%)"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceTrendChart;
