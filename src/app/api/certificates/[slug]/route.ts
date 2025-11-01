import { NextResponse } from 'next/server'
import PDFDocument from 'pdfkit'
import { Readable } from 'stream'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

// ✅ Helper: Stream PDF from PDFKit
function createStreamFromDoc(doc: InstanceType<typeof PDFDocument>) {

  const stream = new Readable({ read() {} })
  doc.on('data', (chunk) => stream.push(chunk))
  doc.on('end', () => stream.push(null))
  return stream
}

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> } // ✅ Awaitable params for Next.js 15+
) {
  const { slug } = await context.params // ✅ Must await params

  // ✅ Course lookup (mock for now)
  const courseTitles: Record<string, string> = {
    'climate-intro': 'Introduction to Climate Change & Emissions',
    'carbon-developer': 'Carbon Developer Essentials',
    'ghg-accounting': 'Diploma in GHG Accounting',
  }

  const courseTitle = courseTitles[slug]
  if (!courseTitle)
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })

  // ✅ Dynamic data (later from DB/session)
  const studentName = 'Brian Njau Njata'
  const issueDate = new Date().toLocaleDateString()
  const verificationUrl = `https://eco-mentor.vercel.app/verify/${slug}-${Date.now()}`

  // ✅ Generate QR code
  const qrBuffer = await QRCode.toBuffer(verificationUrl)

  // ✅ Create new PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const stream = createStreamFromDoc(doc)

  // ✅ Register font (to avoid Helvetica ENOENT error)
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf')
  if (fs.existsSync(fontPath)) {
    doc.font(fontPath)
  } else {
    console.warn('⚠️ Font not found, using default font.')
  }

  // 🎨 Border
  doc
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .strokeColor('#1B5E20')
    .lineWidth(2)
    .stroke()

  // 🪶 Logo (optional)
  const logoPath = path.join(process.cwd(), 'public', 'logo.png')
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 40, { width: 90 })
  }

  // 🏆 Title
  doc
    .fontSize(28)
    .fillColor('#1B5E20')
    .text('Certificate of Completion', { align: 'center', underline: true })
    .moveDown(2)

  // 🧑‍🎓 Recipient
  doc
    .fontSize(16)
    .fillColor('#333')
    .text('This certifies that', { align: 'center' })
    .moveDown(1)
    .fontSize(24)
    .fillColor('#000')
    .text(studentName, { align: 'center', underline: true })
    .moveDown(1)
    .fontSize(16)
    .fillColor('#333')
    .text('has successfully completed the course:', { align: 'center' })
    .moveDown(0.5)
    .fontSize(20)
    .fillColor('#1B5E20')
    .text(courseTitle, { align: 'center' })
    .moveDown(2)

  // 🕒 Issue info
  doc
    .fontSize(14)
    .fillColor('#555')
    .text(`Issued on ${issueDate}`, { align: 'center' })
    .moveDown(1)

  // ✅ Signature area
  const signaturePath = path.join(process.cwd(), 'public', 'signature.png')
  if (fs.existsSync(signaturePath)) {
    doc.image(signaturePath, doc.page.width / 2 - 100, 520, { width: 100 })
  }

  doc
    .fontSize(12)
    .fillColor('#333')
    .text('Dr. Jane Kimani', doc.page.width / 2 - 50, 630, { align: 'center' })
    .text('Lead Instructor, Eco-Mentor Academy', {
      align: 'center',
    })

  // ✅ QR Code
  doc.image(qrBuffer, doc.page.width - 150, doc.page.height - 180, { width: 100 })
  doc
    .fontSize(10)
    .fillColor('#666')
    .text('Scan to verify', doc.page.width - 140, doc.page.height - 75)

  doc.end()

  return new NextResponse(stream as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${slug}-certificate.pdf"`,
    },
  })
}
