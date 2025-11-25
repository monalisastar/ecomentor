import axios from "axios";
import FormData from "form-data";

const PINATA_JWT = process.env.PINATA_JWT!;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

/**
 * 📦 uploadToPinata()
 * ------------------------------------------------------------
 * Handles both:
 *  1️⃣ Initial upload (PDFs or metadata JSON)
 *  2️⃣ Updating an existing JSON (merge + re-pin new version)
 */
export async function uploadToPinata(
  input: Buffer | Record<string, any>,
  fileName?: string,
  previousHash?: string // ← optional for updating an existing JSON
): Promise<{ ipfsUri: string; publicGatewayUrl: string }> {
  if (!PINATA_JWT) throw new Error("Missing Pinata JWT token in environment variables.");

  try {
    console.log("📡 Uploading to Pinata...");

    // 🧩 Case 1: File upload (PDF, image, etc.)
    if (Buffer.isBuffer(input)) {
      const formData = new FormData();
      formData.append("file", input, {
        filename: fileName || "upload.bin",
        contentType: "application/pdf",
      });

      formData.append(
        "pinataMetadata",
        JSON.stringify({
          name: fileName || "EcoMentor_Certificate",
          keyvalues: { source: "Eco-Mentor LMS", type: "certificate" },
        })
      );

      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
          ...formData.getHeaders(),
        },
      });

      const ipfsHash = res.data.IpfsHash;
      return {
        ipfsUri: `ipfs://${ipfsHash}`,
        publicGatewayUrl: `${PINATA_GATEWAY}${ipfsHash}`,
      };
    }

    // 🧩 Case 2: JSON upload or update
    let updatedMetadata = input;

    // 🧠 If updating a previous pinned record
    if (previousHash) {
      try {
        const prevUrl = `${PINATA_GATEWAY}${previousHash}`;
        const prevRes = await axios.get(prevUrl);
        const prevData = prevRes.data || {};
        updatedMetadata = { ...prevData, ...input }; // merge new fields
        console.log("🧩 Merged metadata with previous version.");
      } catch (err) {
        console.warn("⚠️ Failed to fetch previous metadata — creating new.");
      }
    }

    const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", updatedMetadata, {
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        "Content-Type": "application/json",
      },
    });

    const ipfsHash = res.data.IpfsHash;
    return {
      ipfsUri: `ipfs://${ipfsHash}`,
      publicGatewayUrl: `${PINATA_GATEWAY}${ipfsHash}`,
    };
  } catch (error: any) {
    console.error("❌ Pinata upload failed:", error.response?.data || error.message);
    throw new Error("Failed to upload to Pinata.");
  }
}
