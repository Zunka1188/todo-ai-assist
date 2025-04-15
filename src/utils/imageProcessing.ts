
/**
 * Compresses an image file to reduce its size
 * 
 * @param file The image file to compress
 * @param maxSizeMB Maximum size in MB
 * @param maxWidth Maximum width in pixels
 * @returns A promise that resolves to the compressed file
 */
export const compressImage = async (
  file: File, 
  maxSizeMB: number = 1, 
  maxWidth: number = 1200
): Promise<File> => {
  // If the file is already smaller than the target size, return it as is
  if (file.size <= maxSizeMB * 1024 * 1024) {
    return file;
  }

  // Create a canvas to resize the image
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Create a new image element and load the file
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Calculate the new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image on the canvas at the new dimensions
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert the canvas to a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new file from the blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            
            console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        0.7 // Quality parameter: 0.7 provides a good balance between quality and size
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    
    // Read the file as a data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Mock implementation for image upload
 * In a real app, this would upload to a server
 * 
 * @param file The file to upload
 * @returns A promise that resolves to the URL of the uploaded image
 */
export const uploadImage = async (file: File): Promise<string> => {
  // First compress the image
  const compressedFile = await compressImage(file);
  
  // In a real application, we would upload this to a server
  // For now, create a local data URL for testing
  const dataUrl = await getImagePreviewUrl(compressedFile);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log('Image "uploaded" - actual implementation would send to server');
  
  // Return the data URL as the "uploaded" URL
  return dataUrl;
};

/**
 * Gets a base64 data URL from an image file
 * 
 * @param file The file to read
 * @returns A promise that resolves to the data URL
 */
export const getImagePreviewUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};
