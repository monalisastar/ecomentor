"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

type Announcement = { id: string; message: string }
type Discussion = { id: string; title: string; posts: number }
type Assignment = { title: string; instructions: string }

export type EngagementData = {
  announcements: Announcement[]
  discussions: Discussion[]
  gamification: {
    badges: boolean
    points: boolean
    completionTracking: boolean
  }
  assignments: Assignment[]
}

export default function Step4Engagement({
  data,
  setData,
}: {
  data: { engagement: EngagementData }
  setData: (newData: any) => void
}) {
  const engagement = data.engagement || {
    announcements: [],
    discussions: [],
    gamification: { badges: true, points: true, completionTracking: true },
    assignments: [],
  }

  // --- Local state for controlled inputs ---
  const [newAnnouncement, setNewAnnouncement] = useState("")
  const [newDiscussion, setNewDiscussion] = useState("")
  const [newAssignmentTitle, setNewAssignmentTitle] = useState("")
  const [newAssignmentInstructions, setNewAssignmentInstructions] = useState("")

  const updateEngagement = (updates: Partial<EngagementData>) => {
    setData({ ...data, engagement: { ...engagement, ...updates } })
  }

  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) return
    updateEngagement({
      announcements: [
        ...engagement.announcements,
        { id: Date.now().toString(), message: newAnnouncement.trim() },
      ],
    })
    setNewAnnouncement("")
  }

  const addDiscussion = () => {
    if (!newDiscussion.trim()) return
    updateEngagement({
      discussions: [
        ...engagement.discussions,
        { id: Date.now().toString(), title: newDiscussion.trim(), posts: 0 },
      ],
    })
    setNewDiscussion("")
  }

  const addAssignment = () => {
    if (!newAssignmentTitle.trim()) return
    updateEngagement({
      assignments: [
        ...engagement.assignments,
        {
          title: newAssignmentTitle.trim(),
          instructions: newAssignmentInstructions.trim(),
        },
      ],
    })
    setNewAssignmentTitle("")
    setNewAssignmentInstructions("")
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
      <h2 className="text-2xl font-bold">Step 4: Engagement & Interaction</h2>

      {/* Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {engagement.announcements.map((a) => (
            <div key={a.id} className="p-2 border rounded-md bg-muted">
              {a.message}
            </div>
          ))}
          <Textarea
            placeholder="Write a new announcement..."
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), addAnnouncement())}
          />
          <Button onClick={addAnnouncement}>+ Post Announcement</Button>
        </CardContent>
      </Card>

      {/* Discussions */}
      <Card>
        <CardHeader>
          <CardTitle>Discussion Forums</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {engagement.discussions.map((d) => (
            <div
              key={d.id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              <span>{d.title}</span>
              <Badge>{d.posts} posts</Badge>
            </div>
          ))}
          <Input
            placeholder="New discussion topic..."
            value={newDiscussion}
            onChange={(e) => setNewDiscussion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDiscussion()}
          />
          <Button onClick={addDiscussion}>+ Create Discussion</Button>
        </CardContent>
      </Card>

      {/* Gamification */}
      <Card>
        <CardHeader>
          <CardTitle>Gamification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {["badges", "points", "completionTracking"].map((feature) => (
            <div key={feature} className="flex items-center justify-between">
              <span>
                {feature === "badges"
                  ? "Enable Badges"
                  : feature === "points"
                  ? "Enable Points"
                  : "Track Completion %"}
              </span>
              <Switch
                checked={engagement.gamification[feature as keyof typeof engagement.gamification]}
                onCheckedChange={(val) =>
                  updateEngagement({
                    gamification: { ...engagement.gamification, [feature]: val },
                  })
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {engagement.assignments.map((a, i) => (
            <div key={i} className="p-3 border rounded-md">
              <h4 className="font-semibold">{a.title}</h4>
              <p className="text-sm text-muted-foreground">{a.instructions}</p>
            </div>
          ))}
          <Input
            placeholder="Assignment Title"
            value={newAssignmentTitle}
            onChange={(e) => setNewAssignmentTitle(e.target.value)}
          />
          <Textarea
            placeholder="Assignment Instructions"
            value={newAssignmentInstructions}
            onChange={(e) => setNewAssignmentInstructions(e.target.value)}
          />
          <Button onClick={addAssignment}>+ Add Assignment</Button>
        </CardContent>
      </Card>
    </div>
  )
}
