export interface ItemImageUpload {
  file: File;
  itemId: string;
  roomId: string;
  wishlistId: string;
}

export interface ItemImageService {
  uploadItemImage(input: ItemImageUpload): Promise<string>;
}
