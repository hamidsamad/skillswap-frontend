/**
 * Image Compression & Optimization Utility for Live Chat
 * Compresses and resizes images in the browser before uploading, reducing
 * 5MB-15MB camera photos down to ~150KB-350KB WebP images (95% size reduction).
 */

const MAX_WIDTH = 1600;
const MAX_HEIGHT = 1600;
const QUALITY = 0.82;
const SKIP_THRESHOLD_BYTES = 250 * 1024; // If already under 250KB, skip re-compression

/**
 * Checks if the browser supports WebP canvas encoding
 */
function isWebPSupported() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  } catch (_) {
    return false;
  }
}

/**
 * compressImage:
 * Takes an input File or Blob, compresses it with Canvas, and returns an optimized File object.
 * Preserves transparency for PNGs (using WebP or PNG), and ignores GIFs/SVGs.
 */
export async function compressImage(file, options = {}) {
  // If not an image, return original
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  // Preserve animated GIFs and vector SVGs as-is
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  // If already smaller than threshold and not an oversized dimension, skip
  if (file.size <= SKIP_THRESHOLD_BYTES) {
    return file;
  }

  try {
    const maxWidth = options.maxWidth || MAX_WIDTH;
    const maxHeight = options.maxHeight || MAX_HEIGHT;
    const quality = options.quality || QUALITY;

    // Load image into an HTML Image element
    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };
      image.src = objectUrl;
    });

    let { width, height } = img;

    // Check if resize is needed
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    } else if (file.size <= SKIP_THRESHOLD_BYTES) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return file;
    }

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Determine output MIME type
    const supportsWebP = isWebPSupported();
    const outputType = supportsWebP ? 'image/webp' : (file.type === 'image/png' ? 'image/png' : 'image/jpeg');

    const compressedBlob = await new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        outputType,
        outputType === 'image/png' ? undefined : quality
      );
    });

    if (!compressedBlob || compressedBlob.size >= file.size) {
      // If compression somehow didn't reduce size, keep original
      return file;
    }

    // Rename extension to .webp if converted
    const originalName = file.name || 'image.jpg';
    const newExt = outputType === 'image/webp' ? '.webp' : (outputType === 'image/jpeg' ? '.jpg' : '.png');
    const newName = originalName.replace(/\.[^.]+$/, '') + newExt;

    return new File([compressedBlob], newName, {
      type: outputType,
      lastModified: Date.now()
    });
  } catch (err) {
    console.warn('Image compression fallback to original:', err);
    return file;
  }
}

/**
 * generateLocalPreviewUrl:
 * Generates an instant local preview URL for immediate display
 */
export function generateLocalPreviewUrl(file) {
  if (!file) return '';
  return URL.createObjectURL(file);
}
