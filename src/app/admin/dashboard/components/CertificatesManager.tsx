'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, XCircle, Database } from 'lucide-react'

interface Certificate {
  id: string
  student: string
  course: string
  type: 'pdf' | 'blockchain'
  status: 'pending' | 'issued' | 'revoked'
  date: string
}

const mockCertificates: Certificate[] = [
  {
    id: 'cert-001',
    student: 'John Doe',
    course: 'Climate Science 101',
    type: 'pdf',
    status: 'issued',
    date: '2025-09-05',
  },
  {
    id: 'cert-002',
    student: 'Jane Smith',
    course: 'Carbon Accounting',
    type: 'blockchain',
    status: 'pending',
    date: '2025-09-04',
  },
]

export default function CertificatesManager() {
  const [certificates, setCertificates] = useState(mockCertificates)

  const handleIssue = (id: string) => {
    setCertificates(prev =>
      prev.map(cert =>
        cert.id === id ? { ...cert, status: 'issued' } : cert
      )
    )
  }

  const handleRevoke = (id: string) => {
    setCertificates(prev =>
      prev.map(cert =>
        cert.id === id ? { ...cert, status: 'revoked' } : cert
      )
    )
  }

  return (
    <motion.div
      className="p-6 rounded-2xl glass-card shadow-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Certificates Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-white">
              <thead>
                <tr className="text-left border-b border-white/20">
                  <th className="px-4 py-2">Student</th>
                  <th className="px-4 py-2">Course</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map(cert => (
                  <tr
                    key={cert.id}
                    className="border-b border-white/10 hover:bg-white/10 transition"
                  >
                    <td className="px-4 py-2">{cert.student}</td>
                    <td className="px-4 py-2">{cert.course}</td>
                    <td className="px-4 py-2 flex items-center gap-2">
                      {cert.type === 'pdf' ? (
                        <FileText className="w-4 h-4 text-blue-300" />
                      ) : (
                        <Database className="w-4 h-4 text-green-300" />
                      )}
                      {cert.type.toUpperCase()}
                    </td>
                    <td className="px-4 py-2">
                      {cert.status === 'issued' && (
                        <span className="text-green-400 font-semibold">Issued</span>
                      )}
                      {cert.status === 'pending' && (
                        <span className="text-yellow-300 font-semibold">Pending</span>
                      )}
                      {cert.status === 'revoked' && (
                        <span className="text-red-400 font-semibold">Revoked</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{cert.date}</td>
                    <td className="px-4 py-2 flex gap-2">
                      {cert.status !== 'issued' && (
                        <Button
                          size="sm"
                          className="bg-green-500/80 hover:bg-green-600 text-white"
                          onClick={() => handleIssue(cert.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Issue
                        </Button>
                      )}
                      {cert.status !== 'revoked' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="bg-red-500/80 hover:bg-red-600 text-white"
                          onClick={() => handleRevoke(cert.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
