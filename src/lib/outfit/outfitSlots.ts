import type { Outfit, OutfitSlotId, Product } from "@/lib/types";

export const OUTFIT_SLOTS: Array<{
  id: OutfitSlotId;
  label: string;
  accepts: Product["category"][];
}> = [
  { id: "top", label: "Top", accepts: ["top"] },
  { id: "bottom", label: "Bottom", accepts: ["bottom"] },
  { id: "outerwear", label: "Outerwear", accepts: ["outerwear"] },
  { id: "shoes", label: "Shoes", accepts: ["shoes"] },
  { id: "accessory", label: "Accessory", accepts: ["accessory"] },
];

export const emptyOutfit = (): Outfit => ({
  top: null,
  bottom: null,
  outerwear: null,
  shoes: null,
  accessory: null,
});

