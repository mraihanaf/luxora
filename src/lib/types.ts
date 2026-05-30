export type ProductCategory = "top" | "bottom" | "outerwear" | "shoes" | "accessory";

export type ProductTag =
  | "new"
  | "editorial"
  | "tailored"
  | "sheer"
  | "liquid"
  | "runway"
  | "minimal"
  | "night"
  | "day"
  | "sustainable";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  tags: ProductTag[];
  image: string;
};

export type CartLine = {
  productId: string;
  qty: number;
};

export type OutfitSlotId = "top" | "bottom" | "outerwear" | "shoes" | "accessory";

export type Outfit = Record<OutfitSlotId, string | null>;

