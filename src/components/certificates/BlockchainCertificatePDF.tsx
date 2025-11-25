'use client'

import React, { useEffect, useState } from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import QRCode from 'qrcode'

// 🧩 Register fonts
Font.register({
  family: 'Poppins',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrFJA.woff2' },
  ],
})
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2' },
  ],
})

const styles = StyleSheet.create({
  page: { backgroundColor: '#fff', padding: 50, fontFamily: 'Poppins' },
  border: { border: '8 solid #1c7c54', padding: 30, borderRadius: 10 },
  header: { textAlign: 'center', marginBottom: 25 },
  logo: { width: 90, height: 90, margin: '0 auto 10 auto' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1c7c54' },
  subtitle: { fontSize: 12, color: '#444', marginBottom: 8 },
  recipient: { textAlign: 'center', marginTop: 40, marginBottom: 10 },
  recipientName: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  courseTitle: { textAlign: 'center', fontSize: 14, color: '#333', marginBottom: 30 },
  blockchainSection: {
    borderTop: '1 solid #ddd',
    paddingTop: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftText: { width: '70%', fontSize: 10, color: '#333' },
  qr: { width: 70, height: 70 },
  footer: { textAlign: 'center', fontSize: 10, color: '#777', marginTop: 20 },
})

interface Props {
  studentName: string
  courseTitle: string
  issueDate: string
  certificateId: string
  txHash: string
  verifyUrl: string
  issuer?: string
}

export default function BlockchainCertificatePDF({
  studentName,
  courseTitle,
  issueDate,
  certificateId,
  txHash,
  verifyUrl,
  issuer = 'Eco-Mentor Academy',
}: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  // Generate QR Code after mount
  useEffect(() => {
    QRCode.toDataURL(verifyUrl, { width: 150 }).then(setQrDataUrl)
  }, [verifyUrl])

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.header}>
            <Image src="/images/logo.png" style={styles.logo} />
            <Text style={styles.title}>Blockchain Certificate of Completion</Text>
            <Text style={styles.subtitle}>
              Empowering Climate Education — Verifiable on the Blockchain
            </Text>
          </View>

          <View style={styles.recipient}>
            <Text style={styles.recipientName}>{studentName}</Text>
          </View>

          <Text style={styles.courseTitle}>
            has successfully completed the course <Text style={{ fontWeight: 'bold' }}>{courseTitle}</Text>
          </Text>

          <Text style={{ textAlign: 'center', color: '#444', fontSize: 12 }}>
            Issued on {issueDate} by {issuer}
          </Text>

          <View style={styles.blockchainSection}>
            <View style={styles.leftText}>
              <Text>Certificate ID: {certificateId}</Text>
              <Text>Blockchain TxHash: {txHash}</Text>
              <Text>Verification URL:</Text>
              <Text>{verifyUrl}</Text>
            </View>
            {qrDataUrl && <Image src={qrDataUrl} style={styles.qr} />}
          </View>

          <Text style={styles.footer}>
            © {new Date().getFullYear()} {issuer}. Immutable. Authentic. Permanent.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
