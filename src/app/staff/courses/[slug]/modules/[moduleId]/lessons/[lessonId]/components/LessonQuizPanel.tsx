'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'

interface LessonQuiz {
  id?: string
  question: string
  options: string[]
  correct: string
}

interface LessonQuizPanelProps {
  lessonId: string
}

export default function LessonQuizPanel({ lessonId }: LessonQuizPanelProps) {
  const [quizzes, setQuizzes] = useState<LessonQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 🔄 Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}/quiz`)
        if (!res.ok) throw new Error('Failed to load quizzes')
        const data = await res.json()

        setQuizzes(
          data.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: [q.optionA, q.optionB, q.optionC, q.optionD],
            correct: q.correct,
          }))
        )
      } catch (err: any) {
        console.error(err)
        toast.error(err.message || 'Error loading quizzes')
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) fetchQuizzes()
  }, [lessonId])

  // ➕ Add new question
  const addQuestion = () => {
    setQuizzes([
      ...quizzes,
      { question: '', options: ['', '', '', ''], correct: '' },
    ])
  }

  // 🗑 Delete question
  const deleteQuestion = async (index: number) => {
    const quizToDelete = quizzes[index]
    setQuizzes(quizzes.filter((_, i) => i !== index))

    // Remove from DB if persisted
    if (quizToDelete.id) {
      try {
        await fetch(`/api/lessons/${lessonId}/quiz?id=${quizToDelete.id}`, {
          method: 'DELETE',
        })
        toast.success('🗑 Question deleted')
      } catch {
        toast.error('Failed to delete question')
      }
    }
  }

  // 💾 Save all quizzes (bulk save)
  const saveAll = async () => {
    try {
      setSaving(true)
      const validQuizzes = quizzes.filter((q) => q.question.trim() !== '')
      if (validQuizzes.length === 0)
        throw new Error('Please add at least one question.')

      const res = await fetch(`/api/lessons/${lessonId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validQuizzes),
      })

      if (!res.ok) throw new Error('Failed to save quizzes')

      toast.success('✅ Quizzes saved successfully!')
      const data = await res.json()
      console.log('Saved quizzes:', data)
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Error saving quizzes')
    } finally {
      setSaving(false)
    }
  }

  // 🌀 Loading indicator
  if (loading)
    return (
      <div className="text-center text-gray-300 py-10">
        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
        <p>Loading quiz questions...</p>
      </div>
    )

  return (
    <motion.div
      key="quiz"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-green-300">Lesson Quizzes</h3>
        <Button
          onClick={addQuestion}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16} />
          Add Question
        </Button>
      </div>

      {/* Empty State */}
      {quizzes.length === 0 && (
        <p className="text-gray-400 text-sm italic">No quizzes added yet.</p>
      )}

      {/* Quiz List */}
      {quizzes.map((quiz, i) => (
        <div
          key={quiz.id || i}
          className="border border-white/10 bg-white/5 rounded-lg p-4 space-y-4"
        >
          {/* Question Row */}
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-200">
              Question {i + 1}
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteQuestion(i)}
              className="text-red-400 border-red-400/40 hover:bg-red-500/10"
            >
              <Trash2 size={14} />
              Delete
            </Button>
          </div>

          <Input
            value={quiz.question}
            onChange={(e) => {
              const updated = [...quizzes]
              updated[i].question = e.target.value
              setQuizzes(updated)
            }}
            className="bg-white/10 text-white border-white/30 placeholder-gray-400"
            placeholder="Enter question text"
          />

          {/* Options A–D */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['A', 'B', 'C', 'D'].map((letter, idx) => (
              <div key={idx}>
                <label className="text-xs text-gray-300">Option {letter}</label>
                <Input
                  value={quiz.options[idx]}
                  onChange={(e) => {
                    const updated = [...quizzes]
                    updated[i].options[idx] = e.target.value
                    setQuizzes(updated)
                  }}
                  className="bg-white/10 text-white border-white/30 placeholder-gray-400"
                  placeholder={`Enter option ${letter}`}
                />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div>
            <label className="text-xs text-gray-200 block mb-1">
              Correct Answer
            </label>
            <select
              value={quiz.correct}
              onChange={(e) => {
                const updated = [...quizzes]
                updated[i].correct = e.target.value
                setQuizzes(updated)
              }}
              className="w-full p-2 rounded-md bg-[#1b1b1b] border border-gray-500 text-gray-100 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
            >
              <option value="" className="text-gray-400 bg-[#1b1b1b]">
                -- Select Correct Option --
              </option>
              {quiz.options.map((opt, idx) => (
                <option
                  key={idx}
                  value={opt}
                  className="bg-[#1b1b1b] text-gray-100"
                >
                  {String.fromCharCode(65 + idx)}. {opt || `Option ${String.fromCharCode(65 + idx)}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

      {/* Save Button */}
      {quizzes.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={saveAll}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Saving...
              </>
            ) : (
              <>
                <Save size={14} /> Save Quizzes
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
