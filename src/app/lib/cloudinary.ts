/**
 * Cloudinary utility functions for image uploads
 */

/**
 * Upload an image to Cloudinary
 * @param file Image file to upload
 * @param folder Folder path in Cloudinary (e.g., 'applicants/profile')
 * @param onProgress Progress callback function (optional)
 * @returns URL of the uploaded image
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Create a FormData instance
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    ); // Use your Cloudinary upload preset
    formData.append("folder", folder);

    // Create a XMLHttpRequest to track upload progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        true
      );

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          const response = JSON.parse(this.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error("Failed to upload image to Cloudinary"));
        }
      };

      xhr.onerror = function () {
        reject(new Error("Network error during image upload"));
      };

      xhr.send(formData);
    });
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Validate if file is an image and within size limits
 * @param file File to validate
 * @param maxSizeMB Maximum file size in MB
 * @returns Object with validation result and message
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; message: string } {
  // Check if file is an image
  if (!file.type.startsWith("image/")) {
    return { valid: false, message: "Only image files are allowed" };
  }

  // Check file size (convert MB to bytes)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: `File is too large. Maximum size is ${maxSizeMB}MB`,
    };
  }

  return { valid: true, message: "" };
}
