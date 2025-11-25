'use client'

import { useState } from 'react'
import { PlusCircle, Trash2, Edit3, Brain } from 'lucide-react'
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

  // 🧠 Dynamic quiz summary
  const questionCount = quizQuestions.length
  const badgeColor =
    questionCount === 0
      ? 'bg-gray-700 text-gray-300'
      : questionCount < 3
      ? 'bg-yellow-600 text-yellow-100'
      : 'bg-green-600 text-white'

  const badgeLabel =
    questionCount === 0
      ? 'No Questions Yet'
      : questionCount === 1
      ? '1 Question Added'
      : `${questionCount} Questions Added`

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white/90">Lesson Quiz</h2>

          {/* 🧠 Quiz Summary Badge */}
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badgeColor} transition`}
          >
            <Brain size={14} />
            <span>{badgeLabel}</span>
          </div>
        </div>

        <Button
          onClick={() => {
            setModalOpen(true)
            setEditIndex(null)
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium"
        >
          <PlusCircle size={16} />
          Add Question
        </Button>
      </div>

      {/* Empty State */}
      {quizQuestions.length === 0 ? (
        <p className="text-gray-400 text-sm italic">
          No quiz questions yet. Click “Add Question” to create one.
        </p>
      ) : (
        <div className="space-y-4">
          {quizQuestions.map((q, index) => (
            <div
              key={index}
              className="bg-white/[0.07] border border-white/10 rounded-xl p-4 hover:bg-white/[0.1] transition-all duration-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-green-300 font-semibold mb-2 leading-snug">
                    Q{index + 1}. {q.question}
                  </h3>
                  <ul className="text-gray-200 text-sm space-y-1">
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

                <div className="flex gap-2 ml-3 shrink-0">
                  <button
                    onClick={() => {
                      setEditIndex(index)
                      setModalOpen(true)
                    }}
                    className="text-blue-400 hover:text-blue-300 hover:scale-110 transition"
                    title="Edit question"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-400 hover:text-red-300 hover:scale-110 transition"
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

      {/* Modal */}
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
