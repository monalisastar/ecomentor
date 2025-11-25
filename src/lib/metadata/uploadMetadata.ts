import { NextResponse } from "next/server"

/**
 * 📦 uploadMetadata()
 * ---------------------------------------------------------
 * Uploads certificate metadata JSON to Supabase via
 * your existing signed URL route (/api/upload-url).
 *
 * Reuses your secure backend flow — no new Supabase client.
 */
export async function uploadMetadata(certificate: any) {
  try {
    // 🧱 Build metadata JSON
    const metadata = {
      name: certificate.courseTitle,
      description: `Certificate issued to ${certificate.studentName} by Eco-Mentor LMS.`,
      external_url: certificate.verificationUrl,
      attributes: [
        { trait_type: "Issuer", value: certificate.issuedBy },
        { trait_type: "Status", value: certificate.status },
        { trait_type: "Verification ID", value: certificate.verificationId },
        { trait_type: "Network", value: certificate.blockchainNetwork || "pending" },
      ],
      issued_at: new Date().toISOString(),
    }

    const jsonString = JSON.stringify(metadata, null, 2)
    const fileName = `${certificate.verificationId}.json`

    // 1️⃣ Ask your existing backend for a signed upload URL
    const signedUrlRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        fileType: "application/json",
        context: "metadata", // stored under eco-mentor-assets/metadata
      }),
    })

    if (!signedUrlRes.ok) throw new Error("Failed to get signed URL")

    const { uploadUrl, publicUrl, error } = await signedUrlRes.json()
    if (error || !uploadUrl) throw new Error(error || "No signed upload URL returned")

    // 2️⃣ Upload JSON to Supabase via the signed URL
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: jsonString,
    })

    if (!uploadRes.ok)
      throw new Error(`Supabase upload failed: ${uploadRes.statusText}`)

    console.log("✅ Metadata uploaded:", publicUrl)
    return publicUrl
  } catch (err) {
    console.error("❌ Metadata upload failed:", err)
    throw err
  }
}
