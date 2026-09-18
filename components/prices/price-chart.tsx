"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";

interface PriceChartProps {
  data: Array<{
    division: string;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    referencePrice: number;
  }>;
  referencePrice?: number;
}

export default function PriceChart({ data, referencePrice = 1455 }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xs text-slate-400">
        No regional price chart data available.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-navy-950">
            Regional Price Disparity vs BERC Statutory Benchmark
          </h3>
          <p className="text-xs text-slate-500">
            Average reported retail price per division for standard 12kg cylinders.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <span>BERC Ceiling: ৳{referencePrice}</span>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="division"
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              domain={[1300, 1650]}
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              tickFormatter={(val) => `৳${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#061021",
                borderRadius: "10px",
                border: "none",
                color: "#ffffff",
                fontSize: "12px",
              }}
              itemStyle={{ color: "#ffffff" }}
              formatter={(value: any, name: any) => [
                `৳${Number(value).toLocaleString()}`,
                name === "avgPrice"
                  ? "Average Market"
                  : name === "minPrice"
                  ? "Lowest Reported"
                  : "Highest Reported",
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              formatter={(value) =>
                value === "avgPrice"
                  ? "Average Market Price"
                  : value === "minPrice"
                  ? "Lowest Reported"
                  : "Highest Reported"
              }
            />
            <ReferenceLine
              y={referencePrice}
              stroke="#059669"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: `BERC Ceiling: ৳${referencePrice}`,
                position: "insideTopRight",
                fill: "#059669",
                fontSize: 11,
                fontWeight: 700,
              }}
            />
            <Bar dataKey="avgPrice" fill="#0f172a" radius={[6, 6, 0, 0]} maxBarSize={45} />
            <Bar dataKey="lowestPrice" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={20} />
            <Bar dataKey="highestPrice" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
