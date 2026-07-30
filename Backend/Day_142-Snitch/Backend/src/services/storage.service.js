import ImageKit from '@imagekit/nodejs';
import { toFile } from '@imagekit/nodejs';
import { config } from '../config/config.js';

const client = new ImageKit({
     privateKey: config.IMAGEKIT_PRIVATE_KEY,
});

export async function uploadFile({ buffer, fileName, mimeType, folder = "snitch" }) {
     try {
          // Convert buffer to format accepted by ImageKit
          const fileForUpload = await toFile(buffer, fileName, mimeType ? { type: mimeType } : undefined);

          const result = await client.files.upload({
               file: fileForUpload,
               fileName: fileName,
               folder: folder,
               useUniqueFileName: true,     // Recommended
          });

          // Return a shape that works for both top-level product images and variant images
          return {
               URL: result.url,
               url: result.url
          };

     } catch (err) {
          console.error("ImageKit upload failed:", {
               fileName,
               status: err.status || 'Unknown',
               message: err.message,
          });

          if (err instanceof ImageKit.APIError) {
               console.error("ImageKit API Error Details:", err.error);
          }

          throw err; // Let controller handle it
     }
}