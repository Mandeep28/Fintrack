"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  name: string;
  amount: number;
}

interface RoomTrendChartProps {
  data: ChartDataPoint[];
}

export default function RoomTrendChart({ data }: RoomTrendChartProps) {
  return (
    <ResponsiveContainer width="105%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRoomAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
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
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={10}
          fontWeight="bold"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "16px",
          }}
          itemStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: "bold" }}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#06b6d4"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorRoomAmount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
