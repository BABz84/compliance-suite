"use client"

import {
  Line,
  LineChart as RechartsLineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface LineChartProps {
  data: Record<string, any>[]
  categories: string[]
  colors?: string[]
  yAxisWidth?: number
  showLegend?: boolean
}

export function LineChart({
  data,
  categories,
  colors = ["#3a86ff", "#ff006e"],
  yAxisWidth = 40,
  showLegend = false,
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RechartsLineChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="name" />
        <YAxis width={yAxisWidth} />
        <Tooltip />
        {showLegend && <Legend />}
        {categories.map((category, index) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

