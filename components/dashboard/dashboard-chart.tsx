"use client"

import { BarChart, type BarChartProps } from "@/components/ui/bar-chart"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart } from "@/components/ui/line-chart"

// Sample data for the bar chart
const barData: BarChartProps["data"] = [
  {
    name: "Jan",
    "Document Processing": 45,
    "Regulatory Queries": 28,
  },
  {
    name: "Feb",
    "Document Processing": 52,
    "Regulatory Queries": 32,
  },
  {
    name: "Mar",
    "Document Processing": 61,
    "Regulatory Queries": 40,
  },
  {
    name: "Apr",
    "Document Processing": 58,
    "Regulatory Queries": 45,
  },
  {
    name: "May",
    "Document Processing": 75,
    "Regulatory Queries": 52,
  },
  {
    name: "Jun",
    "Document Processing": 87,
    "Regulatory Queries": 58,
  },
  {
    name: "Jul",
    "Document Processing": 92,
    "Regulatory Queries": 64,
  },
]

// Sample data for the line chart
const lineData = [
  {
    name: "Jan",
    "Compliance Score": 82,
  },
  {
    name: "Feb",
    "Compliance Score": 85,
  },
  {
    name: "Mar",
    "Compliance Score": 83,
  },
  {
    name: "Apr",
    "Compliance Score": 87,
  },
  {
    name: "May",
    "Compliance Score": 89,
  },
  {
    name: "Jun",
    "Compliance Score": 92,
  },
  {
    name: "Jul",
    "Compliance Score": 94,
  },
]

export function DashboardChart() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Score</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="pt-4">
          <BarChart
            data={barData}
            categories={["Document Processing", "Regulatory Queries"]}
            colors={["#3a86ff", "#ff006e"]}
            yAxisWidth={40}
            showLegend
          />
        </TabsContent>
        <TabsContent value="compliance" className="pt-4">
          <LineChart
            data={lineData}
            categories={["Compliance Score"]}
            colors={["#10b981"]}
            yAxisWidth={40}
            showLegend
          />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium">Document Processing</div>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">92</div>
              <div className="text-xs text-green-500">+5.4%</div>
            </div>
            <div className="text-xs text-muted-foreground">vs previous month</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium">Regulatory Queries</div>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">64</div>
              <div className="text-xs text-green-500">+10.3%</div>
            </div>
            <div className="text-xs text-muted-foreground">vs previous month</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

