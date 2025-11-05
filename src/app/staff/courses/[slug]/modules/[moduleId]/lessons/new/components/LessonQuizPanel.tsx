'use client'

import { useState } from 'react'
import { PlusCircle, Trash2, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import QuizQuestionModal from './QuizQuestionModal'

import { toast } from 'sonner'

interface LessonQuizPanelProps {
  quizQuestions: {
    question: string
    options: string[]
    correct: string
  }[]
  setQuizQuestions: React.Dispatch<
    React.SetStateAction<
      {
        question: string
        options: string[]
        correct: string
      }[]
    >
  >
}

export default function LessonQuizPanel({
  quizQuestions,
  setQuizQuestions,
}: LessonQuizPanelProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  const handleSaveQuestion = (newQuestion: {
    question: string
    options: string[]
    correct: string
  }) => {
    if (editIndex !== null) {
      const updated = [...quizQuestions]
      updated[editIndex] = newQuestion
      setQuizQuestions(updated)
      setEditIndex(null)
      toast.success('✅ Question updated!')
    } else {
      setQuizQuestions([...quizQuestions, newQuestion])
      toast.success('✅ Question added!')
    }
    setModalOpen(false)
  }

  const handleDelete = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index))
    toast.success('🗑️ Question removed')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Lesson Quiz</h2>
        <Button
          onClick={() => {
            setModalOpen(true)
            setEditIndex(null)
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <PlusCircle size={16} />
          Add Question
        </Button>
      </div>

      {quizQuestions.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No quiz questions yet. Click “Add Question” to create one.
        </p>
      ) : (
        <div className="space-y-4">
          {quizQuestions.map((q, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-green-300 font-semibold mb-1">
                    Q{index + 1}. {q.question}
                  </h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    {q.options.map((opt, i) => (
                      <li
                        key={i}
                        className={`${
                          opt === q.correct
                            ? 'text-green-400 font-medium'
                            : 'text-gray-400'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {opt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditIndex(index)
                      setModalOpen(true)
                    }}
                    className="text-blue-400 hover:text-blue-300"
                    title="Edit question"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete question"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🧩 Question Modal */}
      {modalOpen && (
        <QuizQuestionModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditIndex(null)
          }}
          onSave={handleSaveQuestion}
          initialData={editIndex !== null ? quizQuestions[editIndex] : null}
        />
      )}
    </div>
  )
}
