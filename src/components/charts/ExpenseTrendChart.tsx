"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface ChartDataPoint {
  name: string;
  amount: number;
}

interface ExpenseTrendChartProps {
  data: ChartDataPoint[];
}

export default function ExpenseTrendChart({ data }: ExpenseTrendChartProps) {
  return (
    <ResponsiveContainer width="105%" height="100%" minWidth={0} minHeight={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          fontWeight="bold"
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          fontWeight="bold"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
          dx={-10}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
            padding: "12px",
          }}
          itemStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: "bold" }}
          cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2, strokeDasharray: "5 5" }}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#06b6d4"
          strokeWidth={3.5}
          fillOpacity={1}
          fill="url(#colorAmount)"
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
