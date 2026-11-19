import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../firebase';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit in bytes

/**
 * Validates that the selected file is an image and under 5MB.
 * @param {File} file 
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: "Please choose an image to attach to the report." };
  }
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Invalid file format. Please upload an image file (e.g., JPG, PNG, WEBP)." };
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return { 
      valid: false, 
      error: `Photo is too large (${sizeMb} MB). Maximum allowed size is 5.00 MB.` 
    };
  }
  return { valid: true };
}

/**
 * Compresses an image file locally to a base64 Data URL as a fallback.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > h && w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads photo directly to Cloudinary using fetch POST per requirement #3.
 * POST https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload
 * with body: FormData { file, upload_preset }
 * 
 * If placeholder values remain unconfigured, falls back gracefully to a compressed Data URL
 * so that tests and local development can proceed without breaking report creation.
 * 
 * @param {File} file 
 * @returns {Promise<{ secure_url: string, isCloudinary: boolean }>}
 */
export async function uploadToCloudinary(file) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const isPlaceholder = 
    !CLOUDINARY_CLOUD_NAME || 
    CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME" ||
    !CLOUDINARY_UPLOAD_PRESET ||
    CLOUDINARY_UPLOAD_PRESET === "YOUR_UPLOAD_PRESET";

  if (isPlaceholder) {
    console.warn(
      "[CampusFix] Cloudinary credentials are placeholders. Using local image data URL fallback. " +
      "To upload directly to Cloudinary, update CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in src/firebase.js."
    );
    const localUrl = await fileToDataUrl(file);
    return { secure_url: localUrl, isCloudinary: false };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Cloudinary upload failed (HTTP ${response.status})`;
    console.error("[CampusFix] Cloudinary upload error:", message);
    throw new Error(`Cloudinary Error: ${message}`);
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error("Cloudinary response did not include a secure_url.");
  }

  return { secure_url: data.secure_url, isCloudinary: true };
}
