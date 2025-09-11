"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export type Question = {
  id: string
  type: "mcq" | "truefalse" | "short" | "essay" | "file"
  question: string
  options?: string[]
  correctAnswers?: string[]
  file?: File | null
}

export type Assessment = {
  title: string
  timeLimit: string
  attemptsAllowed: string
  passMark: string
  questions: Question[]
}

export default function Step5Assessment({
  data,
  setData,
}: {
  data: { assessments: Assessment[] }
  setData: (val: any) => void
}) {
  const [newAssessment, setNewAssessment] = useState<Assessment>({
    title: "",
    timeLimit: "",
    attemptsAllowed: "",
    passMark: "",
    questions: [],
  })

  const [newQuestion, setNewQuestion] = useState<Question>({
    id: "",
    type: "mcq",
    question: "",
    options: [],
    correctAnswers: [],
    file: null,
  })

  const addQuestion = () => {
    if (!newQuestion.question.trim() && newQuestion.type !== "file") return
    setNewAssessment({
      ...newAssessment,
      questions: [
        ...newAssessment.questions,
        { ...newQuestion, id: Date.now().toString() },
      ],
    })
    setNewQuestion({
      id: "",
      type: "mcq",
      question: "",
      options: [],
      correctAnswers: [],
      file: null,
    })
  }

  const addAssessment = () => {
    if (!newAssessment.title.trim()) return
    setData({
      ...data,
      assessments: [...(data.assessments || []), newAssessment],
    })
    setNewAssessment({
      title: "",
      timeLimit: "",
      attemptsAllowed: "",
      passMark: "",
      questions: [],
    })
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
      <h2 className="text-2xl font-bold">Step 5: Assessments & Exams</h2>

      {/* Existing Assessments */}
      {(data.assessments || []).map((a, idx) => (
        <Card key={idx} className="border-2 shadow-md">
          <CardHeader>
            <CardTitle>{a.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Time Limit: {a.timeLimit || "None"}, Attempts:{" "}
              {a.attemptsAllowed || "Unlimited"}, Pass Mark: {a.passMark || "N/A"}
            </p>
            <p className="font-semibold mt-3">Questions:</p>
            <ul className="list-disc pl-5 space-y-1">
              {a.questions.map((q) => (
                <li key={q.id}>
                  {q.type.toUpperCase()} → {q.question}
                  {q.type === "file" && q.file && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      📂 {q.file.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {/* New Assessment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Assessment Title"
            value={newAssessment.title}
            onChange={(e) =>
              setNewAssessment({ ...newAssessment, title: e.target.value })
            }
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Time Limit (mins)"
              value={newAssessment.timeLimit}
              onChange={(e) =>
                setNewAssessment({ ...newAssessment, timeLimit: e.target.value })
              }
            />
            <Input
              placeholder="Attempts Allowed"
              value={newAssessment.attemptsAllowed}
              onChange={(e) =>
                setNewAssessment({ ...newAssessment, attemptsAllowed: e.target.value })
              }
            />
            <Input
              placeholder="Pass Mark (%)"
              value={newAssessment.passMark}
              onChange={(e) =>
                setNewAssessment({ ...newAssessment, passMark: e.target.value })
              }
            />
          </div>

          {/* Add Question */}
          <Card className="p-4 border rounded-md space-y-3">
            <h4 className="font-semibold">Add Question</h4>

            <Select
              value={newQuestion.type}
              onValueChange={(val) =>
                setNewQuestion({ ...newQuestion, type: val })
              }
            >
              <SelectTrigger className="w-full border-2 py-2 text-base">
                <SelectValue placeholder="📌 Select Question Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple Choice</SelectItem>
                <SelectItem value="truefalse">True / False</SelectItem>
                <SelectItem value="short">Short Answer</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
                <SelectItem value="file">File Upload</SelectItem>
              </SelectContent>
            </Select>

            {newQuestion.type !== "file" && (
              <Textarea
                placeholder="Enter the question"
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, question: e.target.value })
                }
              />
            )}

            {newQuestion.type === "file" && (
              <div className="mt-2">
                <Input
                  type="file"
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, file: e.target.files?.[0] || null })
                  }
                />
                {newQuestion.file && (
                  <p className="text-sm mt-1">📂 {newQuestion.file.name} selected</p>
                )}
              </div>
            )}

            {newQuestion.type === "mcq" && (
              <div className="space-y-2 mt-2">
                {newQuestion.options?.map((opt, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const updated = [...(newQuestion.options || [])]
                        updated[idx] = e.target.value
                        setNewQuestion({ ...newQuestion, options: updated })
                      }}
                      placeholder={`Option ${idx + 1}`}
                    />
                    <Switch
                      checked={newQuestion.correctAnswers?.includes(opt)}
                      onCheckedChange={(val) => {
                        const updated = val
                          ? [...(newQuestion.correctAnswers || []), opt]
                          : (newQuestion.correctAnswers || []).filter((a) => a !== opt)
                        setNewQuestion({ ...newQuestion, correctAnswers: updated })
                      }}
                    />
                  </div>
                ))}
                <Button
                  size="sm"
                  onClick={() =>
                    setNewQuestion({
                      ...newQuestion,
                      options: [...(newQuestion.options || []), ""],
                    })
                  }
                >
                  + Add Option
                </Button>
              </div>
            )}

            {newQuestion.type === "truefalse" && (
              <div className="flex space-x-4 mt-2">
                <Button
                  variant={newQuestion.correctAnswers?.includes("True") ? "default" : "outline"}
                  onClick={() => setNewQuestion({ ...newQuestion, correctAnswers: ["True"] })}
                >
                  True
                </Button>
                <Button
                  variant={newQuestion.correctAnswers?.includes("False") ? "default" : "outline"}
                  onClick={() => setNewQuestion({ ...newQuestion, correctAnswers: ["False"] })}
                >
                  False
                </Button>
              </div>
            )}

            <Button onClick={addQuestion} className="w-full mt-3">
              + Add Question
            </Button>
          </Card>

          <Button onClick={addAssessment} className="bg-green-600 hover:bg-green-700 w-full">
            ✅ Save Assessment
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
