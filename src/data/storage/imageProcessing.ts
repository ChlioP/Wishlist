const COMPRESSION_THRESHOLD_BYTES = 1024 * 1024;
const MAX_IMAGE_DIMENSION = 2560;

export async function prepareImageForUpload(file: File): Promise<File> {
  if (
    file.type === "image/gif" ||
    file.size <= COMPRESSION_THRESHOLD_BYTES
  ) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const outputType =
      file.type === "image/png" ? "image/webp" : file.type;
    const blob = await canvasToBlob(canvas, outputType, 0.92);
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], replaceExtension(file.name, outputType), {
      type: outputType,
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function replaceExtension(filename: string, type: string): string {
  const extension =
    type === "image/jpeg"
      ? "jpg"
      : type === "image/png"
        ? "png"
        : "webp";
  const base = filename.replace(/\.[^.]+$/, "") || "wishlist-image";
  return `${base}.${extension}`;
}
