import { RepositoryError } from "@/data/repositories/errors";
import type {
  ItemImageService,
  ItemImageUpload,
} from "@/data/storage/contracts";
import {
  MAX_ITEM_IMAGE_BYTES,
  validateImage,
} from "@/data/storage/imageValidation";

export class MockStorageService implements ItemImageService {
  async uploadItemImage({ file }: ItemImageUpload): Promise<string> {
    validateImage(file, MAX_ITEM_IMAGE_BYTES);
    return readAsDataUrl(file);
  }
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(
          new RepositoryError("validation", "Image could not be processed."),
        );
      }
    };
    reader.onerror = () =>
      reject(
        new RepositoryError("validation", "Image could not be processed."),
      );
    reader.readAsDataURL(file);
  });
}
