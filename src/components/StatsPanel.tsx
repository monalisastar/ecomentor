"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import CountUp from "react-countup"
import { LineChart, Line, ResponsiveContainer } from "recharts"

export type Stat = {
  id: number
  label: string
  value: number
  icon?: React.ReactNode
  trend?: number // % change vs last week
  history?: number[] // for sparkline chart
}

type Props = {
  stats: Stat[]
}

export default function StatsPanel({ stats }: Props) {
  return (
    <Card className="col-span-3 bg-gradient-to-r from-emerald-50 to-sky-50 border-emerald-100">
      <CardHeader>
        <CardTitle className="text-emerald-700 font-semibold">
          Platform Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col items-center justify-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition w-full"
            >
              {/* Icon */}
              {stat.icon && (
                <div className="mb-2 p-3 rounded-full bg-emerald-100 text-emerald-600">
                  {stat.icon}
                </div>
              )}

              {/* Value with animation */}
              <span className="text-3xl font-extrabold text-gray-900">
                <CountUp end={stat.value} duration={1.5} separator="," />
              </span>

              {/* Label */}
              <span className="text-sm text-gray-500">{stat.label}</span>

              {/* Trend */}
              {stat.trend !== undefined && (
                <span
                  className={`flex items-center gap-1 text-xs mt-1 ${
                    stat.trend >= 0 ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {stat.trend >= 0 ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {Math.abs(stat.trend)}% vs last week
                </span>
              )}

              {/* Sparkline */}
              {stat.history && stat.history.length > 0 && (
                <div className="mt-3 w-full h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stat.history.map((v, i) => ({ i, v }))}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={stat.trend && stat.trend >= 0 ? "#10b981" : "#ef4444"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
