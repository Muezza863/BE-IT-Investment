import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../services/b2Connect.js";

/**
 * Menghasilkan URL presigned untuk melihat gambar dari Backblaze B2 (Bucket Private)
 * @param {string} key - Path file di dalam bucket (misal: avatars/user-123.jpg)
 * @returns {Promise<string|null>} - URL yang bisa digunakan di browser atau null jika gagal
 */
export const getImageUrl = async (key) => {
  if (!key) return null;
  
  // Jika key sudah berupa URL (fallback untuk data lama), kembalikan langsung
  if (key.startsWith("http")) return key;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.B2_KEY_NAME, // Menggunakan B2_KEY_NAME sesuai konfirmasi user
      Key: key,
    });

    // Generate URL yang berlaku selama 3600 detik (1 jam)
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
};
