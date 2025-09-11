"use client"

import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export type ActivityPoint = {
  day: string   // e.g. "Mon", "Tue"
  hour: number  // 0–23
  value: number // activity intensity
}

type Props = {
  data: ActivityPoint[]
}

const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// 🔹 Match colors to 4 legend buckets
const getColor = (value: number) => {
  if (value < 4) return "#d1fae5"   // Low
  if (value < 8) return "#6ee7b7"   // Medium
  if (value < 12) return "#10b981"  // High
  return "#065f46"                  // Very High
}

export default function ActivityHeatmap({ data }: Props) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis
                type="number"
                dataKey="hour"
                name="Hour"
                domain={[0, 23]}
                ticks={[0, 6, 12, 18, 23]}
                tickFormatter={(h) =>
                  h === 0 ? "12AM" : h === 12 ? "12PM" : h > 12 ? `${h - 12}PM` : `${h}AM`
                }
              />
              <YAxis
                type="category"
                dataKey="day"
                name="Day"
                domain={daysOrder}
                tick={{ fontSize: 12 }}
              />
              {/* 🔹 Bubble size scales with activity */}
              <ZAxis type="number" dataKey="value" range={[60, 200]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(val: any, _: any, p: any) => [
                  `${val} activities`,
                  `${p.payload.day}, ${p.payload.hour}:00`,
                ]}
              />
              <Scatter data={data}>
                {data.map((point, i) => (
                  <Cell key={i} fill={getColor(point.value)} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* 🔹 Legend */}
        <div className="flex justify-center gap-3 mt-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-sm" style={{ background: "#d1fae5" }}></span> Low
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-sm" style={{ background: "#6ee7b7" }}></span> Medium
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-sm" style={{ background: "#10b981" }}></span> High
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-sm" style={{ background: "#065f46" }}></span> Very High
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
