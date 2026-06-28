import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WishlistItemForm } from "@/components/wishlist/WishlistItemForm";
import { MAX_ITEM_IMAGE_BYTES } from "@/data/storage/imageValidation";

function renderForm() {
  return render(
    <WishlistItemForm onCancel={vi.fn()} onSubmit={vi.fn()} />,
  );
}

function getImageInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector<HTMLInputElement>(
    'input[type="file"]',
  );
  if (!input) throw new Error("Image file input was not rendered.");
  return input;
}

describe("WishlistItemForm image input", () => {
  it("shows an accessible error for an oversized image", () => {
    const { container } = renderForm();
    const file = new File(
      [new Uint8Array(MAX_ITEM_IMAGE_BYTES + 1)],
      "large.jpg",
      { type: "image/jpeg" },
    );

    fireEvent.change(getImageInput(container), {
      target: { files: [file] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Image must be 5 MB or smaller.",
    );
  });

  it("shows an accessible error for an unsupported file type", () => {
    const { container } = renderForm();
    const file = new File(["<svg />"], "vector.svg", {
      type: "image/svg+xml",
    });

    fireEvent.change(getImageInput(container), {
      target: { files: [file] },
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Choose a JPEG, PNG, WebP, or GIF image.",
    );
  });

  it("accepts a valid image and displays its file name", () => {
    const { container } = renderForm();
    const file = new File(["image"], "gift.webp", {
      type: "image/webp",
    });

    fireEvent.change(getImageInput(container), {
      target: { files: [file] },
    });

    expect(screen.getByText("gift.webp")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("exposes image upload progress and disables form actions", () => {
    render(
      <WishlistItemForm
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
        uploading
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Uploading image");
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /uploading/i })).toBeDisabled();
  });
});
