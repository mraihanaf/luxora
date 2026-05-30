import type { Outfit, OutfitSlotId } from "@/lib/types"
import { productTypeLabels, slotToProductType } from "@/lib/storefront"

export const OUTFIT_SLOTS: Array<{
  id: OutfitSlotId
  label: string
  productType: ReturnType<typeof getSlotProductType>
}> = [
  { id: "top", label: productTypeLabels.TOP, productType: getSlotProductType("top") },
  { id: "bottom", label: productTypeLabels.BOTTOM, productType: getSlotProductType("bottom") },
  { id: "headwear", label: productTypeLabels.HEADWEAR, productType: getSlotProductType("headwear") },
]

export const emptyOutfit = (): Outfit => ({
  top: null,
  bottom: null,
  headwear: null,
})

function getSlotProductType(slotId: OutfitSlotId) {
  return slotToProductType[slotId]
}
