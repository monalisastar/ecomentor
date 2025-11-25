'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface LessonQuizPanelProps {
  lessonId: string
  courseSlug: string
  courseTitle: string
  onQuizPassed?: (lessonId: string) => void
}

interface QuizQuestion {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

export default function LessonQuizPanel({
  lessonId,
  courseSlug,
  courseTitle,
  onQuizPassed,
}: LessonQuizPanelProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [isPassed, setIsPassed] = useState<boolean | null>(null)
  const [lockedOut, setLockedOut] = useState<string | null>(null)
  const [alreadyPassed, setAlreadyPassed] = useState(false)
  const [saving, setSaving] = useState(false) // 🧩 NEW — prevent duplicate saves

  // 🧠 Load quiz questions
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/lessons/${lessonId}/quiz`)
        if (!res.ok) throw new Error('Failed to load quiz')
        setQuestions(await res.json())
      } catch (err) {
        console.error(err)
        toast.error('Failed to load quiz questions.')
      }
    }
    if (lessonId) fetchQuiz()
  }, [lessonId])

  // 🧩 Check if quiz already passed
  useEffect(() => {
    async function checkProgress() {
      try {
        const res = await fetch(`/api/progress-records?lessonId=${lessonId}`)
        if (!res.ok) return
        const data = await res.json()
        const record = Array.isArray(data) ? data[0] : data

        if (record?.isPassed) {
          setAlreadyPassed(true)
          setIsSubmitted(true)
          setIsPassed(true)
          setScore(record.score || 100)
          setTimeout(() => onQuizPassed?.(lessonId), 400)
        }
      } catch {
        console.warn('Progress check failed')
      }
    }
    checkProgress()
  }, [lessonId, onQuizPassed])

  const handleSelect = (qid: string, option: string) => {
    if (isSubmitted || lockedOut || alreadyPassed) return
    setAnswers((prev) => ({ ...prev, [qid]: option }))
  }

  // 🧩 Helper — save backend progress once
  async function handleProgressSave() {
    if (saving) return // ⛔ Prevent duplicate calls
    setSaving(true)
    try {
      const res = await fetch('/api/progress-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          courseSlug,
          isPassed: true,
        }),
      })
      const data = await res.json()
      if (res.ok) console.log('✅ Progress saved once:', data)
    } catch (err) {
      console.error('❌ Failed to save progress:', err)
    } finally {
      setSaving(false)
    }
  }

  // ✅ Submit quiz
  const handleSubmit = async () => {
    if (lockedOut) {
      toast.error('⏳ You are temporarily locked out. Please wait before retrying.')
      return
    }

    if (alreadyPassed) {
      toast.info('🎉 You have already passed this quiz.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/lessons/${lessonId}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      const data = await res.json()

      if (res.status === 429) {
        setLockedOut(data.error)
        toast.error(data.error)
        return
      }

      if (res.status === 403 && data.error?.includes('already passed')) {
        setAlreadyPassed(true)
        setIsSubmitted(true)
        setIsPassed(true)
        toast.success('🎉 You have already passed this quiz!')
        onQuizPassed?.(lessonId)
        return
      }

      if (!res.ok) throw new Error(data.error || 'Quiz submission failed')

      setScore(data.score)
      setIsPassed(data.isPassed)
      setIsSubmitted(true)

      if (data.isPassed) {
        toast.success(`✅ You passed! Score: ${data.score}%`)
        await handleProgressSave() // 🧩 Save once

        try {
          const progressRes = await fetch(
            `/api/progress-records?courseSlug=${courseSlug}&summary=1`
          )
          const progressData = await progressRes.json()
          const { progress, completed } = progressData

          if (completed || progress === 100) {
            toast.info('🎓 Course complete! Issuing your Eco-Mentor certificate...')
            const issueRes = await fetch(`/api/certificates/auto-issue`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ courseSlug, courseTitle }),
            })

            const issueData = await issueRes.json()

            if (issueRes.ok) {
              toast.success('🥳 Certificate issued successfully!')
            } else {
              console.warn('Certificate not issued:', issueData.error)
              toast.error('⚠️ Could not issue certificate automatically.')
            }
          }
        } catch (err) {
          console.warn('Certificate auto-issue skipped:', err)
        }

        setTimeout(() => onQuizPassed?.(lessonId), 1200)
      } else {
        toast.warning(`⚠️ Score: ${data.score}%. Review and try again.`)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Submission failed.')
    } finally {
      setLoading(false)
    }
  }

  // 🎉 Success block
  if (alreadyPassed) {
    return (
      <motion.section
        className="mt-12 bg-white shadow-sm rounded-lg p-6 border border-gray-100 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lesson Quiz</h3>
        <div className="p-6 bg-green-50 border border-green-300 rounded-lg">
          <p className="text-xl font-semibold mb-1 text-green-700">
            🎉 You already passed this quiz!
          </p>
          <p className="text-sm text-green-600">
            Proceed to the next lesson — your progress is saved.
          </p>
        </div>
      </motion.section>
    )
  }

  if (!questions.length) return null

  return (
    <motion.section
      id="lesson-quiz-section"
      className="mt-12 bg-white shadow-sm rounded-lg p-6 border border-gray-100"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Lesson Quiz</h3>

      {lockedOut && (
        <div className="p-4 mb-4 text-center text-red-700 bg-red-100 border border-red-300 rounded-lg">
          <p className="font-medium">{lockedOut}</p>
          <p className="text-sm text-red-600 mt-1">
            You can retake this quiz after your cooldown ends.
          </p>
        </div>
      )}

      {isSubmitted && score !== null ? (
        <div className="text-center py-8">
          <p className="text-xl font-semibold">
            Your Score:{' '}
            <span className={isPassed ? 'text-green-600' : 'text-red-600'}>
              {score}%
            </span>
          </p>
          {isPassed ? (
            <p className="mt-2 text-green-700 font-medium">🎉 You passed this quiz!</p>
          ) : (
            <p className="mt-2 text-red-600">
              You didn’t pass. Review and try again.
            </p>
          )}
        </div>
      ) : (
        <>
          <form className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="border-b border-gray-100 pb-4">
                <p className="font-medium text-gray-800 mb-2">
                  {idx + 1}. {q.question}
                </p>
                <div className="space-y-2">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                    const val = (q as any)[`option${opt}`]
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 text-sm cursor-pointer ${
                          answers[q.id] === val
                            ? 'text-green-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={val}
                          checked={answers[q.id] === val}
                          onChange={() => handleSelect(q.id, val)}
                          disabled={isSubmitted || !!lockedOut}
                        />
                        {val}
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </form>

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={loading || isSubmitted || !!lockedOut}
              className={`mt-6 px-8 py-3 rounded-lg font-medium transition disabled:opacity-50 ${
                lockedOut
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading
                ? 'Submitting...'
                : lockedOut
                ? 'Locked - Retry Later'
                : 'Submit Quiz'}
            </button>
          </div>
        </>
      )}
    </motion.section>
  )
}
