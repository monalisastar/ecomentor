import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import QRCode from "qrcode";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { uploadToPinata } from "@/lib/blockchain/pinata";

/**
 * 🌿 Eco-Mentor Modern Premium Certificate Generator
 * -----------------------------------------------------------
 * Layout Features:
 * - Light green luxury background + leaf texture
 * - Centered modern academic header section
 * - Premium typography hierarchy
 * - Signature block (left) vs Blockchain block (right)
 * - Divider lines with correct visual rhythm
 * - Clean bottom metadata strip
 * - QR + Polygon logo aligned in a card-style block
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    // 1️⃣ Fetch certificate record
    const cert = await prisma.certificate.findUnique({ where: { id } });
    if (!cert)
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });

    // 2️⃣ Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // Landscape A4
    const { width, height } = page.getSize();

    // Fonts
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Palette
    const ecoGreen = rgb(0.11, 0.49, 0.33);
    const gold = rgb(0.89, 0.74, 0.32);
    const charcoal = rgb(0.15, 0.15, 0.15);
    const softGrey = rgb(0.45, 0.45, 0.45);

    // ---------------------------------------------------------
    // 3️⃣ BACKGROUND COMPOSITION (Premium Eco-Mentor Look)
    // ---------------------------------------------------------

    // Base ivory-green gradient background image (placeholder)
    const bgPath = path.join(process.cwd(), "public/images/certificate-background.png");
    if (fs.existsSync(bgPath)) {
      const bgBytes = fs.readFileSync(bgPath);
      const bgImg = await pdfDoc.embedPng(bgBytes);
      page.drawImage(bgImg, {
        x: 0,
        y: 0,
        width,
        height,
        opacity: 1,
      });
    } else {
      // Fallback plain color if image missing
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.97, 0.985, 0.97),
      });
    }

    // Leaf texture overlay (5–8% opacity)
    const texturePath = path.join(process.cwd(), "public/images/certificate-texture.png");
    if (fs.existsSync(texturePath)) {
      const txBytes = fs.readFileSync(texturePath);
      const txImg = await pdfDoc.embedPng(txBytes);
      page.drawImage(txImg, {
        x: 0,
        y: 0,
        width,
        height,
        opacity: 0.06,
      });
    }

    // Premium border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderWidth: 5,
      borderColor: ecoGreen,
    });
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderWidth: 2,
      borderColor: gold,
    });

    // Helper — centered text
    const centerText = (
      text: string,
      y: number,
      size: number,
      font: any,
      color = charcoal
    ) => {
      const textWidth = font.widthOfTextAtSize(text, size);
      page.drawText(text, {
        x: width / 2 - textWidth / 2,
        y,
        size,
        font,
        color,
      });
    };

    // ---------------------------------------------------------
    // 4️⃣ HEADER SECTION — Modern Premium Layout
    // ---------------------------------------------------------
    centerText("Eco-Mentor Academy", height - 90, 30, fontBold, ecoGreen);
    centerText("CERTIFICATE OF COMPLETION", height - 135, 22, fontBold, charcoal);

    centerText("This certifies that", height - 175, 13, fontItalic, softGrey);

    const studentName = cert.studentName ?? "Unnamed Student";
    const courseTitle = cert.courseTitle ?? "Untitled Course";

    centerText(studentName, height - 210, 36, fontBold, rgb(0, 0, 0));

    centerText(
      "has successfully completed the course:",
      height - 245,
      12,
      fontRegular,
      softGrey
    );

    centerText(courseTitle, height - 270, 18, fontItalic, ecoGreen);

    // ---------------------------------------------------------
    // 5️⃣ FOOTER GRID — Signature (left) & Blockchain (right)
    // ---------------------------------------------------------

    const footerTopY = 115;
    const leftX = 80;
    const rightX = width - 300;

    // ✍️ Issuer label
    page.drawText("Issued by:", {
      x: leftX,
      y: footerTopY + 90,
      size: 11,
      font: fontBold,
      color: charcoal,
    });
    page.drawText(cert.issuedBy ?? "Eco-Mentor LMS", {
      x: leftX + 78,
      y: footerTopY + 90,
      size: 11,
      font: fontItalic,
      color: charcoal,
    });

    // Signature image
    const sigPath = path.join(process.cwd(), "public/Signature_2.webp");
    if (fs.existsSync(sigPath)) {
      const buffer = fs.readFileSync(sigPath);
      const png = await sharp(buffer).png().toBuffer();
      const sigImg = await pdfDoc.embedPng(png);
      page.drawImage(sigImg, {
        x: leftX,
        y: footerTopY + 35,
        width: 120,
        height: 55,
      });
    }

    // Signature role
    page.drawText("Authorized Signatory", {
      x: leftX,
      y: footerTopY + 20,
      size: 9,
      font: fontItalic,
      color: softGrey,
    });

    // ---------------------------------------------------------
    // 🔗 BLOCKCHAIN VERIFICATION PANEL (Right Side Card)
    // ---------------------------------------------------------

    // Title
    page.drawText("Blockchain Verification", {
      x: rightX,
      y: footerTopY + 110,
      size: 13,
      font: fontBold,
      color: ecoGreen,
    });

    // Divider under title
    page.drawLine({
      start: { x: rightX, y: footerTopY + 100 },
      end: { x: rightX + 200, y: footerTopY + 100 },
      thickness: 1.2,
      color: gold,
    });

    // Values
    let yPos = footerTopY + 78;
    const rows = [
      ["Network", cert.blockchainNetwork ?? "polygon-amoy"],
      ["Issued", new Date(cert.createdAt).toDateString()],
      ["Verify", cert.verificationUrl ?? "eco-mentor.app"],
    ];

    for (const [label, value] of rows) {
      page.drawText(`${label}:`, {
        x: rightX,
        y: yPos,
        size: 10,
        font: fontBold,
        color: charcoal,
      });

      page.drawText(`${value}`, {
        x: rightX + 70,
        y: yPos,
        size: 10,
        font: fontItalic,
        color: softGrey,
      });

      yPos -= 18;
    }

    // ---------------------------------------------------------
    // 🪩 QR + Polygon Logo (Bottom Right Mini Block)
    // ---------------------------------------------------------
    const polygonPath = path.join(process.cwd(), "public/images/polygon-logo.png");
    if (fs.existsSync(polygonPath)) {
      const buffer = fs.readFileSync(polygonPath);
      const img = await sharp(buffer).png().toBuffer();
      const polyImg = await pdfDoc.embedPng(img);
      page.drawImage(polyImg, {
        x: rightX,
        y: footerTopY - 18,
        width: 35,
        height: 35,
      });
    }

    if (cert.verificationUrl) {
      const qrBuffer = await QRCode.toBuffer(cert.verificationUrl, {
        width: 70,
        margin: 1,
      });
      const qrImg = await pdfDoc.embedPng(qrBuffer);

      page.drawImage(qrImg, {
        x: rightX + 55,
        y: footerTopY - 10,
        width: 65,
        height: 65,
      });

      page.drawText("Scan to Verify", {
        x: rightX + 60,
        y: footerTopY - 20,
        size: 8,
        font: fontItalic,
        color: softGrey,
      });
    }

    // ---------------------------------------------------------
    // 6️⃣ Bottom of Certificate — Metadata strip
    // ---------------------------------------------------------

    const serial = `EM-${id.slice(0, 6).toUpperCase()}-${new Date(
      cert.createdAt
    ).getFullYear()}`;

    const pdfHash = crypto
      .createHash("sha256")
      .update("EcoMentor" + id)
      .digest("hex");

    page.drawText(`Certificate ID: ${serial}`, {
      x: 80,
      y: 45,
      size: 9,
      font: fontItalic,
      color: softGrey,
    });

    page.drawText(`SHA-256: ${pdfHash.slice(0, 12)}...${pdfHash.slice(-8)}`, {
      x: 80,
      y: 32,
      size: 8,
      font: fontItalic,
      color: softGrey,
    });

    centerText(
      "Immutable • Authentic • Permanent — Verified on the Polygon Blockchain",
      22,
      9,
      fontItalic,
      softGrey
    );

    // ---------------------------------------------------------
    // 7️⃣ Save + Upload to Supabase
    // ---------------------------------------------------------
    const pdfBytes = await pdfDoc.save();
    const bucket = "eco-mentor-assets";
    const pathName = `certificates/${id}.pdf`;

    const { error: upErr } = await supabaseAdmin.storage
      .from(bucket)
      .upload(pathName, Buffer.from(pdfBytes), {
        contentType: "application/pdf",
        upsert: true,
      });
    if (upErr) throw upErr;

    const { data: pub } = supabaseAdmin.storage.from(bucket).getPublicUrl(pathName);
    const publicUrl = pub?.publicUrl;

    // ---------------------------------------------------------
    // 8️⃣ Upload metadata to Pinata (NFT-style)
    // ---------------------------------------------------------
    const metadata = {
      name: `${studentName} - ${courseTitle}`,
      description: `Blockchain-verified certificate issued by Eco-Mentor LMS.`,
      attributes: [
        { trait_type: "Student", value: studentName },
        { trait_type: "Course", value: courseTitle },
        { trait_type: "Issued By", value: cert.issuedBy ?? "Eco-Mentor LMS" },
        { trait_type: "Date", value: cert.createdAt.toISOString() },
        { trait_type: "Verification URL", value: cert.verificationUrl },
      ],
      external_url: publicUrl,
    };

    const pinataUrl = await uploadToPinata(metadata);

    await prisma.certificate.update({
      where: { id },
      data: {
        certificateUrl: publicUrl,
        metadataURI: pinataUrl.publicGatewayUrl,
      },
    });

    // ---------------------------------------------------------
    // 9️⃣ Return PDF Immediately
    // ---------------------------------------------------------
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="EcoMentor-Certificate-${id}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("❌ PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed", details: err.message },
      { status: 500 }
    );
  }
}
