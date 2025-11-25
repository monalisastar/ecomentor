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

  // ✅ disable background scroll when modal opens
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question)
      setOptions(initialData.options)
      setCorrect(initialData.correct)
    } else {
      setQuestion('')
      setOptions(['', '', '', ''])
      setCorrect('')
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
        // ✅ now fully blocks background interaction
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-[99999] pointer-events-auto"
        style={{ backdropFilter: 'blur(3px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#101316] border border-white/15 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white relative z-[100000]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <h2 className="text-xl font-semibold mb-4 text-white/90">
            {initialData ? 'Edit Question' : 'Add New Question'}
          </h2>

          {/* Question */}
          <div className="mb-4">
            <label className="block text-sm text-gray-200 mb-1">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 outline-none resize-none"
              placeholder="e.g. What is the main greenhouse gas?"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i}>
                <label className="block text-sm text-gray-200 mb-1">
                  Option {String.fromCharCode(65 + i)}
                </label>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) =>
                    setOptions((prev) => {
                      const updated = [...prev]
                      updated[i] = e.target.value
                      return updated
                    })
                  }
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder={`Enter option ${String.fromCharCode(65 + i)}`}
                />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div className="mt-5">
            <label className="block text-sm text-gray-200 mb-2">
              Select Correct Answer
            </label>
            <select
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#101316] text-white border border-white/20 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
            >
              <option value="">-- Select Correct Option --</option>
              {options.map((opt, i) => (
                <option key={i} value={`opt-${i}`}>
                  {String.fromCharCode(65 + i)}. {opt || `Option ${String.fromCharCode(65 + i)}`}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-200 border-gray-600 hover:bg-white/10 transition"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold transition"
            >
              Save Question
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
