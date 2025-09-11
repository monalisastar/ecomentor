"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export type Lecturer = {
  id: number
  name: string
}

type Props = {
  lecturers: Lecturer[]
}

export default function LecturersMarquee({ lecturers }: Props) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Lecturers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-marquee flex gap-8">
            {lecturers.map((lecturer) => (
              <span
                key={lecturer.id}
                className="text-muted-foreground text-lg font-medium"
              >
                {lecturer.name}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
