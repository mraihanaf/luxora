export type StorefrontProductType = "TOP" | "BOTTOM" | "HEADWEAR";

export type StorefrontProduct = {
  id: string;
  type: StorefrontProductType;
  name: string;
  description: string | null;
  imageUrl: string;
  priceIdr: number;
  videoUrl: string | null;
};

export type StorefrontProductVideoStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type StorefrontProductVideo = {
  id: string;
  productsHash: string;
  videoKey: string | null;
  videoUrl: string | null;
  videoId: string | null;
  triggerRunId: string | null;
  workflowStatus: StorefrontProductVideoStatus;
  progressPercent: number;
  progressLabel: string | null;
  errorMessage: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  products: StorefrontProduct[];
};

export type CartLine = {
  productId: string;
  qty: number;
};

export type OutfitSlotId = "top" | "bottom" | "headwear";

export type Outfit = Record<OutfitSlotId, string | null>;
