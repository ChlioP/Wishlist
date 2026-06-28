import type {
  ItemImageService,
  ItemImageUpload,
} from "@/data/storage/contracts";
import { MockStorageService } from "@/data/storage/MockStorageService";
import {
  MAX_ITEM_IMAGE_BYTES,
  validateImage,
} from "@/data/storage/imageValidation";
import { prepareImageForUpload } from "@/data/storage/imageProcessing";
import { dataProvider } from "@/lib/firebaseConfig";

const mockStorageService = new MockStorageService();
let selectedService: Promise<ItemImageService> | null = null;

function getSelectedService(): Promise<ItemImageService> {
  if (selectedService) return selectedService;
  selectedService =
    dataProvider === "firebase"
      ? import("@/data/storage/FirebaseStorageService").then(
          ({ FirebaseStorageService }) => new FirebaseStorageService(),
        )
      : Promise.resolve(mockStorageService);
  return selectedService;
}

export const itemImageService: ItemImageService = {
  async uploadItemImage(input) {
    validateImage(input.file, MAX_ITEM_IMAGE_BYTES);
    const file = await prepareImageForUpload(input.file);
    return (await getSelectedService()).uploadItemImage({
      ...input,
      file,
    });
  },
};

export { MockStorageService };
export type { ItemImageService, ItemImageUpload };
