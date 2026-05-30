import type { Product } from "@/lib/types";

const img = (prompt: string, imageSize: string = "portrait_4_3") =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${imageSize}`;

export const products: Product[] = [
  {
    id: "lx-veil-top",
    name: "Veil of Canopy Top",
    price: 168,
    category: "top",
    tags: ["new", "sheer", "night", "editorial"],
    image: img(
      "high-end studio fashion product photo, sheer dark emerald organza long-sleeve top on invisible mannequin, subtle gold thread piping, moody green-black background, soft rim lighting, luxury editorial, ultra realistic, 85mm, shallow depth of field",
    ),
  },
  {
    id: "lx-atelier-shirt",
    name: "Atelier Column Shirt",
    price: 142,
    category: "top",
    tags: ["minimal", "tailored", "day"],
    image: img(
      "luxury studio fashion product photo, structured minimalist shirt in deep forest green with hidden placket and gold cuff accent, on invisible mannequin, clean shadows, warm off-white highlights, premium editorial, ultra realistic",
    ),
  },
  {
    id: "lx-moss-trouser",
    name: "Mossline Trousers",
    price: 198,
    category: "bottom",
    tags: ["tailored", "minimal", "sustainable"],
    image: img(
      "premium studio fashion product photo, tailored wide-leg trousers in near-black green wool, crisp crease, subtle gold waist hardware, on invisible mannequin, dark luxurious backdrop, ultra realistic, editorial",
    ),
  },
  {
    id: "lx-liquid-skirt",
    name: "Liquid Glass Skirt",
    price: 184,
    category: "bottom",
    tags: ["new", "liquid", "night", "runway"],
    image: img(
      "high-end studio fashion product photo, satin midi skirt with iridescent obsidian sheen and gold reflective highlights, on invisible mannequin, dramatic side light, luxury editorial, ultra realistic",
    ),
  },
  {
    id: "lx-forest-coat",
    name: "Forest Haze Coat",
    price: 420,
    category: "outerwear",
    tags: ["editorial", "tailored", "runway"],
    image: img(
      "luxury studio fashion product photo, long tailored coat in deep forest green with subtle gold edge stitching, sculptural collar, on invisible mannequin, cinematic lighting, premium editorial, ultra realistic",
    ),
  },
  {
    id: "lx-obsidian-bomber",
    name: "Obsidian Circuit Bomber",
    price: 312,
    category: "outerwear",
    tags: ["new", "night", "liquid"],
    image: img(
      "high-end studio fashion product photo, modern bomber jacket in near-black green with faint circuit-line jacquard texture and gold zipper, on invisible mannequin, moody backdrop, luxury editorial, ultra realistic",
    ),
  },
  {
    id: "lx-aura-heels",
    name: "Aura Heels",
    price: 260,
    category: "shoes",
    tags: ["editorial", "night"],
    image: img(
      "luxury studio product photo, elegant heels in matte obsidian with gold metallic heel and thin gold ankle strap, isolated on dark background, soft reflections, ultra realistic, editorial",
    ),
  },
  {
    id: "lx-canopy-loafers",
    name: "Canopy Loafers",
    price: 240,
    category: "shoes",
    tags: ["day", "minimal", "tailored"],
    image: img(
      "premium studio product photo, sleek loafers in deep green leather with small gold emblem, isolated on dark background, soft rim light, ultra realistic, luxury editorial",
    ),
  },
  {
    id: "lx-gilded-scarf",
    name: "Gilded Whisper Scarf",
    price: 96,
    category: "accessory",
    tags: ["new", "editorial", "day"],
    image: img(
      "luxury studio product photo, silky scarf in warm off-white with subtle gold star motif and deep green border, draped elegantly, soft studio light, ultra realistic, editorial",
    ),
  },
  {
    id: "lx-mono-bag",
    name: "Space Mono Bag",
    price: 285,
    category: "accessory",
    tags: ["minimal", "night", "runway"],
    image: img(
      "high-end studio product photo, small structured handbag in near-black green with gold clasp, clean silhouette, dramatic lighting, ultra realistic, luxury editorial",
    ),
  },
  {
    id: "lx-gold-earcuff",
    name: "Golden Hour Earcuff",
    price: 78,
    category: "accessory",
    tags: ["new", "night", "editorial"],
    image: img(
      "luxury studio product photo, minimalist gold earcuff with soft glow, macro lens, dark background, subtle reflection, ultra realistic",
    ),
  },
  {
    id: "lx-glass-necklace",
    name: "Frosted Obsidian Pendant",
    price: 124,
    category: "accessory",
    tags: ["liquid", "editorial"],
    image: img(
      "premium studio product photo, frosted glass pendant with gold chain, obsidian tint, soft refraction, dark luxe background, ultra realistic, editorial",
    ),
  },
];

export const productById = new Map(products.map((p) => [p.id, p]));

