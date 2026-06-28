import { describe, expect, it } from "vitest";

import { RepositoryError } from "@/data/repositories/errors";
import {
  MAX_ITEM_IMAGE_BYTES,
  validateImage,
} from "@/data/storage/imageValidation";

function imageFile(size: number, type: string): File {
  return new File([new Uint8Array(size)], "image.bin", { type });
}

describe("validateImage", () => {
  it.each(["image/jpeg", "image/png", "image/webp", "image/gif"])(
    "accepts %s files up to 5 MB",
    (type) => {
      expect(() =>
        validateImage(imageFile(MAX_ITEM_IMAGE_BYTES, type)),
      ).not.toThrow();
    },
  );

  it("rejects images larger than 5 MB with a user-facing message", () => {
    expect(() =>
      validateImage(imageFile(MAX_ITEM_IMAGE_BYTES + 1, "image/jpeg")),
    ).toThrow(
      expect.objectContaining<Partial<RepositoryError>>({
        code: "validation",
        message: "Image must be 5 MB or smaller.",
      }),
    );
  });

  it.each(["image/svg+xml", "application/pdf", ""])(
    "rejects unsupported type %s",
    (type) => {
      expect(() => validateImage(imageFile(100, type))).toThrow(
        "Choose a JPEG, PNG, WebP, or GIF image.",
      );
    },
  );
});
