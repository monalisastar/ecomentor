'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuizQuestionModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { question: string; options: string[]; correct: string }) => void
  initialData?: { question: string; options: string[]; correct: string } | null
}

export default function QuizQuestionModal({
  open,
  onClose,
  onSave,
  initialData,
}: QuizQuestionModalProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correct, setCorrect] = useState('')

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question)
      setOptions(initialData.options)
      setCorrect(initialData.correct)
    }
  }, [initialData])

  const handleSave = () => {
    if (!question.trim()) return alert('Please enter a question.')
    if (options.some((o) => !o.trim())) return alert('Please fill all options.')
    if (!correct.trim()) return alert('Select the correct answer.')

    onSave({ question, options, correct })
    onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>

          <h2 className="text-xl font-semibold mb-4">
            {initialData ? 'Edit Question' : 'Add New Question'}
          </h2>

          {/* Question */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-green-500 outline-none resize-none"
              placeholder="e.g. What is the main greenhouse gas?"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i}>
                <label className="block text-sm text-gray-300 mb-1">
                  Option {String.fromCharCode(65 + i)}
                </label>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const updated = [...options]
                    updated[i] = e.target.value
                    setOptions(updated)
                  }}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder={`Enter option ${String.fromCharCode(65 + i)}`}
                />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-2">
              Select Correct Answer
            </label>
            <select
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">-- Select Correct Option --</option>
              {options.map((opt, i) => (
                <option key={i} value={opt}>
                  {String.fromCharCode(65 + i)}. {opt || 'Option'}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-300 border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Save Question
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
