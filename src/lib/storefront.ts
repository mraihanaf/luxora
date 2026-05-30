import type { OutfitSlotId, StorefrontProductType } from "@/lib/types"

export const productTypeLabels: Record<StorefrontProductType, string> = {
  TOP: "Top",
  BOTTOM: "Bottom",
  HEADWEAR: "Headwear",
}

export const slotToProductType: Record<OutfitSlotId, StorefrontProductType> = {
  top: "TOP",
  bottom: "BOTTOM",
  headwear: "HEADWEAR",
}

export const productTypeToSlot: Record<StorefrontProductType, OutfitSlotId> = {
  TOP: "top",
  BOTTOM: "bottom",
  HEADWEAR: "headwear",
}

export function formatIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}
