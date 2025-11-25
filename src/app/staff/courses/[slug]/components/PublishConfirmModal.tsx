'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function PublishConfirmModal({ open, onClose, onConfirm }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !open) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 text-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <AlertCircle className="text-yellow-400 w-6 h-6" />
              <h2 className="text-lg font-semibold">Publish Course?</h2>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              Once published, this course will become visible to all enrolled students.
              Make sure you’ve added all required modules, lessons, and uploaded resources
              (PPT, PDF, videos).
            </p>

            <div className="flex items-center gap-2 mt-4">
              <CheckCircle2 className="text-green-400 w-4 h-4" />
              <span className="text-sm text-gray-300">
                Modules and lessons reviewed
              </span>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                className="text-gray-300 border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Confirm Publish
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
