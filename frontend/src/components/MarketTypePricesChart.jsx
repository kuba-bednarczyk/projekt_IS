import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MarketTypePricesChart = ({ data }) => {
  return (
    <div className="w-full h-96 bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
          <XAxis
            dataKey="period"
            stroke="#a1a1aa"
            fontSize={12}
            angle={-45}
            interval={1}
            textAnchor="end"
            dy={10}
            height={60}
          />
          <YAxis stroke="#a1a1aa" fontSize={12} />

          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7" }}
            formatter={(value) => `${value} zł`}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />

          {/* Rynek Pierwotny - np. ciemniejszy niebieski */}
          <Area
            type="monotone"
            dataKey="pierwotny"
            name="Rynek Pierwotny"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
          />

          {/* Rynek Wtórny - np. szary/fioletowy */}
          <Area
            type="monotone"
            dataKey="wtorny"
            name="Rynek Wtórny"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketTypePricesChart;
