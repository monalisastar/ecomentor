import prisma from "@/lib/prisma"
import { ethers } from "ethers"
import { uploadToPinata } from "./pinata" // 👈 ensure this helper exists

const CONTRACT_ADDRESS = process.env.ECO_CERT_CONTRACT!
const PRIVATE_KEY = process.env.PRIVATE_KEY!
const RPC_URL = process.env.POLYGON_AMOY_RPC_URL!

const ABI = [
  "function mintCertificate(address student, string uri) external",
  "event CertificateMinted(address indexed to, uint256 tokenId, string uri)",
]

/**
 * 🪙 mintCertificateOnChain()
 * ---------------------------------------------------------
 * Automatically uploads metadata to Pinata if missing,
 * then mints certificate via organization wallet.
 */
export async function mintCertificateOnChain(certificate: any, metadataURI?: string) {
  try {
    let finalURI = metadataURI || certificate.metadataURI

    // 🧩 Step 1: Upload metadata to Pinata if not provided
    if (!finalURI) {
      console.log("🧠 No metadata URI found — generating and uploading to Pinata...")

      const metadata = {
        name: `${certificate.courseTitle} Certificate`,
        description: `Issued to ${certificate.studentName} for completing ${certificate.courseTitle} on Eco-Mentor LMS.`,
        image: "https://eco-mentor-lms-prod.vercel.app/images/certificate-yellow.png",
        external_url: certificate.verificationUrl || "https://eco-mentor-lms-prod.vercel.app",
        attributes: [
          { trait_type: "Student", value: certificate.studentName },
          { trait_type: "Course", value: certificate.courseTitle },
          { trait_type: "Status", value: certificate.status },
          { trait_type: "Issued Date", value: certificate.issueDate },
          { trait_type: "Platform", value: "Eco-Mentor LMS" },
        ],
      }

      const { ipfsUri } = await uploadToPinata(metadata)
      finalURI = ipfsUri
      console.log("✅ Metadata uploaded to IPFS:", finalURI)
    }

    // 🔁 Step 2: Prevent double-minting
    if (certificate.blockchainTx) {
      console.log(`⚠️ Certificate ${certificate.verificationId} already minted: ${certificate.blockchainTx}`)
      return certificate
    }

    // ⚙️ Step 3: Connect to Polygon Amoy using org wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet)
    const issuerAddress = await wallet.getAddress()

    console.log(`🚀 Minting certificate from org wallet: ${issuerAddress}`)
    console.log(`🔗 Metadata URI: ${finalURI}`)

    // 🧾 Step 4: Execute mint (org wallet issues certificate to itself)
    const tx = await contract.mintCertificate(issuerAddress, finalURI)
    const receipt = await tx.wait()

    console.log(`✅ Mint successful — TX Hash: ${tx.hash}`)

    // 💾 Step 5: Update certificate in Prisma
    const updated = await prisma.certificate.update({
      where: { id: certificate.id },
      data: {
        status: "VERIFIED",
        verifiedBy: certificate.verifiedBy ?? "Eco-Mentor Org Wallet",
        blockchainTx: tx.hash,
        blockchainContract: CONTRACT_ADDRESS,
        blockchainNetwork: "polygon-amoy",
        metadataURI: finalURI,
        updatedAt: new Date(),
      },
    })

    return updated
  } catch (err: any) {
    console.error("❌ Blockchain mint error:", err)
    throw new Error(`Blockchain mint failed: ${err.message}`)
  }
}
