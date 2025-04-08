
/**
 * Utilities for handling images in the shopping list application
 */

/**
 * Compresses an image and returns it as a data URL
 * @param file The image file to compress
 * @param maxWidth The maximum width of the compressed image
 * @param quality The quality of the compressed image (0 to 1)
 * @returns A promise that resolves to the compressed image as a data URL
 */
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        // Create canvas for the compressed image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        console.log('[DEBUG] imageUtils - Image compressed', {
          originalSize: Math.round(file.size / 1024), // KB
          compressedSize: Math.round(compressedDataUrl.length * 0.75 / 1024), // KB (approximate)
          reduction: Math.round((1 - (compressedDataUrl.length * 0.75) / file.size) * 100) + '%'
        });
        
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

/**
 * Gets the file size in a human-readable format
 * @param bytes The size in bytes
 * @returns A string with the size and unit (KB, MB)
 */
export const getReadableFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
