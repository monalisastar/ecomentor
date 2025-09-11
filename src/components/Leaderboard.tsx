"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export type LeaderboardEntry = {
  rank: number
  name: string
  score: number
}

type Props = {
  entries: LeaderboardEntry[]
}

export default function Leaderboard({ entries }: Props) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center justify-between py-2 border-b last:border-b-0"
            >
              <span className="font-medium">
                #{entry.rank} {entry.name}
              </span>
              <span className="text-muted-foreground">{entry.score} pts</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
