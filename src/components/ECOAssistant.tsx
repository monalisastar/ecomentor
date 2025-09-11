'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

export default function ECOAssistant() {
  const [open, setOpen] = useState(false)

  return (
    <AnimatePresence>
      {/* Floating Button */}
      {!open && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 p-4 rounded-full shadow-lg z-50"
        >
          <MessageCircle size={24} className="text-white" />
        </motion.button>
      )}

      {/* Assistant Panel */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 right-8 w-80 h-96 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-300 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">ECO Assistant</h3>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto text-gray-800 dark:text-gray-100">
            <p>Hello! I’m your ECO Assistant 🌱</p>
            <p>Ask me anything about your courses, certificates, or climate learning journey.</p>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-300 dark:border-gray-700">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
