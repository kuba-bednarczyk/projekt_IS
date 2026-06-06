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
      <div className="w-full h-100 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-center">
        <p className="text-zinc-500">Brak danych do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className="w-full h-100 bg-zinc-50 rounded-lg border border-zinc-200 p-2 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          
          <XAxis
            dataKey="period"
            stroke="#71717a"
            style={{ fontSize: "11px" }}
            angle={-45}
            textAnchor="end"
            height={60}
            tickMargin={10}
          />
          
          <YAxis
            yAxisId="left"
            stroke="#71717a"
            domain={[(min) => Math.max(0, Math.floor(min / 100) * 100), "auto"]}
            allowDataOverflow={true}
            tickCount={6} // Mniej ticków dla przejrzystości
            // Jednostka "zł" w ticku, aby usunąć osobną etykietę (label)
            tickFormatter={(value) => `${value.toLocaleString("pl-PL")}`}
            style={{ fontSize: "11px" }}
            axisLine={false}
            tickLine={false}
          />
          
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#71717a"
            domain={["dataMin", "auto"]}
            tickCount={6}
            style={{ fontSize: "11px" }}
            tickFormatter={(value) => `${value}%`} // Jednostka % w ticku
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "13px"
            }}
            formatter={(value, name) => {
              if (name === "Trend cen/m² (zł)") {
                return [`${Number(value).toFixed(0)} zł`, name];
              }
              return [`${Number(value).toFixed(2)}%`, name];
            }}
            labelStyle={{ color: "#18181b", fontWeight: "bold", marginBottom: "4px" }}
          />
          
          <Legend 
            wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} 
            iconType="circle"
          />
          
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgPrice"
            stroke="#3b82f6"
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }} 
            name="Trend cen/m² (zł)"
            isAnimationActive={true}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgRate"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
            name="Stopa ref. NBP (%)"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceTrendChart;