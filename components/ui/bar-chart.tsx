"use client"

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface BarChartProps {
  data: Record<string, any>[]
  categories: string[]
  colors?: string[]
  yAxisWidth?: number
  showLegend?: boolean
}

export function BarChart({
  data,
  categories,
  colors = ["#3a86ff", "#ff006e"],
  yAxisWidth = 40,
  showLegend = false,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="name" />
        <YAxis width={yAxisWidth} />
        <Tooltip />
        {showLegend && <Legend />}
        {categories.map((category, index) => (
          <Bar key={category} dataKey={category} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

