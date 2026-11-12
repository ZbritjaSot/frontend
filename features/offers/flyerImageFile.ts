export const FLYER_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const FLYER_IMAGE_MIN_WIDTH = 1280;
export const FLYER_IMAGE_MIN_HEIGHT = 720;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function flyerImageFileError(
  file: { name: string; type: string; size: number },
  pixels?: { width: number; height: number } | null,
): string | null {
  const named = /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!ALLOWED_TYPES.has(file.type) && !named) {
    return "Ngarko një foto JPEG, PNG ose WebP.";
  }

  if (file.size > FLYER_IMAGE_MAX_BYTES) {
    return "Fotoja duhet të jetë më e vogël se 8 MB.";
  }

  if (pixels == null) {
    return null;
  }

  if (pixels.width <= pixels.height) {
    return "Fotoja duhet të jetë e gjerë (më e gjerë se e lartë). Rekomandohet 16:9, 1920 × 1080 px.";
  }

  if (pixels.width < FLYER_IMAGE_MIN_WIDTH || pixels.height < FLYER_IMAGE_MIN_HEIGHT) {
    return "Fotoja duhet të jetë së paku 1280 × 720 px. Rekomandohet 1920 × 1080 px.";
  }

  return null;
}

export function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const size = { width: image.naturalWidth, height: image.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(size);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    image.src = url;
  });
}
