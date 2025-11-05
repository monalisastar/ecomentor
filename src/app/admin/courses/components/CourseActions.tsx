'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Ban, Eye, FileText } from 'lucide-react'
import { toast } from 'sonner'
import CourseReviewModal from './CourseReviewModal'

interface Course {
  id: string
  title: string
  adminStatus: 'APPROVED' | 'UNDER_REVIEW' | 'REVOKED'
  published: boolean
}

interface Props {
  course: Course
  onActionDone: () => void
}

export default function CourseActions({ course, onActionDone }: Props) {
  const [confirmAction, setConfirmAction] = useState<{
    type: 'APPROVE' | 'REVIEW' | 'REVOKE' | null
    title: string
  }>({ type: null, title: '' })
  const [loading, setLoading] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  // 🧠 Handle status update (Approve/Revoke/Review)
  const handleAction = async (newStatus: 'APPROVED' | 'UNDER_REVIEW' | 'REVOKED') => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/courses/${course.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminStatus: newStatus }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update course status')
      }

      toast.success(
        `Course ${
          newStatus === 'APPROVED'
            ? 'approved'
            : newStatus === 'REVOKED'
            ? 'revoked'
            : 'sent for review'
        } successfully.`
      )
      onActionDone()
      setConfirmAction({ type: null, title: '' })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // 🧩 Reusable button component
  const ActionButton = ({
    label,
    color,
    icon: Icon,
    onClick,
  }: {
    label: string
    color: string
    icon: any
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${color} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      <Icon size={14} /> {label}
    </button>
  )

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* 👁️ View */}
        <ActionButton
          label="View"
          color="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
          icon={Eye}
          onClick={() => toast.info('Course detail view coming soon')}
        />

        {/* 📝 Add Review Note */}
        <ActionButton
          label="Add Note"
          color="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300"
          icon={FileText}
          onClick={() => setShowReviewModal(true)}
        />

        {/* ✅ Approve */}
        {course.adminStatus !== 'APPROVED' && (
          <ActionButton
            label="Approve"
            color="bg-green-100 text-green-700 hover:bg-green-200 border-green-300"
            icon={CheckCircle2}
            onClick={() =>
              setConfirmAction({ type: 'APPROVE', title: 'Approve this course?' })
            }
          />
        )}

        {/* 🟡 Send to Review */}
        {course.adminStatus !== 'UNDER_REVIEW' && (
          <ActionButton
            label="Review"
            color="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300"
            icon={AlertTriangle}
            onClick={() =>
              setConfirmAction({ type: 'REVIEW', title: 'Send course for review?' })
            }
          />
        )}

        {/* 🔴 Revoke */}
        {course.adminStatus !== 'REVOKED' && (
          <ActionButton
            label="Revoke"
            color="bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
            icon={Ban}
            onClick={() =>
              setConfirmAction({ type: 'REVOKE', title: 'Revoke this course?' })
            }
          />
        )}
      </div>

      {/* ⚠️ Confirmation Modal */}
      {confirmAction.type && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md text-center">
            <AlertTriangle className="text-yellow-500 w-10 h-10 mx-auto mb-3" />
            <h2 className="text-lg font-semibold mb-2">{confirmAction.title}</h2>
            <p className="text-gray-600 text-sm mb-5">
              Are you sure you want to{' '}
              {confirmAction.type === 'APPROVE'
                ? 'approve'
                : confirmAction.type === 'REVIEW'
                ? 'send for review'
                : 'revoke'}{' '}
              <span className="font-medium text-gray-800">"{course.title}"</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  if (!confirmAction.type) return
                  handleAction(
                    confirmAction.type === 'APPROVE'
                      ? 'APPROVED'
                      : confirmAction.type === 'REVIEW'
                      ? 'UNDER_REVIEW'
                      : 'REVOKED'
                  )
                }}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white ${
                  confirmAction.type === 'REVOKE'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmAction.type === 'APPROVE'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmAction({ type: null, title: '' })}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 Review Modal */}
      {showReviewModal && (
        <CourseReviewModal
          courseId={course.id}
          courseTitle={course.title}
          onClose={() => setShowReviewModal(false)}
          onSuccess={onActionDone}
        />
      )}
    </>
  )
}
