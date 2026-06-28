import type {
  ItemImageService,
  ItemImageUpload,
} from "@/data/storage/contracts";
import { MockStorageService } from "@/data/storage/MockStorageService";
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
    return (await getSelectedService()).uploadItemImage(input);
  },
};

export { MockStorageService };
export type { ItemImageService, ItemImageUpload };
