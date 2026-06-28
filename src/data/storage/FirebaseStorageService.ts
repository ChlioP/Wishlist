import { FirebaseError } from "firebase/app";
import {
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";

import { RepositoryError } from "@/data/repositories/errors";
import type {
  ItemImageService,
  ItemImageUpload,
} from "@/data/storage/contracts";
import {
  MAX_ITEM_IMAGE_BYTES,
  validateImage,
} from "@/data/storage/imageValidation";
import { getFirebaseStorage } from "@/lib/firebase";

export class FirebaseStorageService implements ItemImageService {
  async uploadItemImage(input: ItemImageUpload): Promise<string> {
    validateImage(input.file, MAX_ITEM_IMAGE_BYTES);
    const filename = `${crypto.randomUUID()}-${sanitizeFilename(
      input.file.name,
    )}`;
    const path = [
      "rooms",
      input.roomId,
      "wishlists",
      input.wishlistId,
      "items",
      input.itemId,
      filename,
    ].join("/");
    try {
      const snapshot = await uploadBytes(
        storageRef(getFirebaseStorage(), path),
        input.file,
        {
          contentType: input.file.type,
          customMetadata: {
            itemId: input.itemId,
            roomId: input.roomId,
            wishlistId: input.wishlistId,
          },
        },
      );
      return getDownloadURL(snapshot.ref);
    } catch (error) {
      if (error instanceof RepositoryError) throw error;
      if (
        error instanceof FirebaseError &&
        error.code === "storage/unauthorized"
      ) {
        throw new RepositoryError(
          "forbidden",
          "You do not have permission to upload an image for this item.",
        );
      }
      throw new RepositoryError("validation", "Image upload failed.");
    }
  }
}

function sanitizeFilename(filename: string): string {
  const safe = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safe || "wishlist-image";
}
