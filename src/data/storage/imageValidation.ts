import { RepositoryError } from "@/data/repositories/errors";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function validateImage(file: File, maxBytes: number): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new RepositoryError(
      "validation",
      "Choose a JPEG, PNG, WebP, or GIF image.",
    );
  }
  if (file.size > maxBytes) {
    throw new RepositoryError(
      "validation",
      `Image must be smaller than ${Math.floor(maxBytes / 1024 / 1024)} MB.`,
    );
  }
}
