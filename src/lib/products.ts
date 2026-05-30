import type { Product } from "@/lib/types";

const localImg = (path: string) => path;

export const products: Product[] = [
  {
    id: "lx-veil-top",
    name: "White T-Shirt",
    price: 168,
    category: "top",
    tags: ["day", "minimal"],
    image: localImg("/PixVerse_Image_Effect_prompt_re-generate a top (1).png"),
  },
  {
    id: "lx-atelier-shirt",
    name: "Blue Short-Sleeve Shirt",
    price: 142,
    category: "top",
    tags: ["day", "tailored", "minimal"],
    image: localImg("/PixVerse_Image_Effect_prompt_change the color .png"),
  },
  {
    id: "lx-moss-trouser",
    name: "Green Jeans",
    price: 198,
    category: "bottom",
    tags: ["day", "minimal", "tailored"],
    image: localImg("/PixVerse_Image_Effect_prompt_regenerate a gree.png"),
  },
  {
    id: "lx-liquid-skirt",
    name: "Black Jeans",
    price: 184,
    category: "bottom",
    tags: ["night", "minimal"],
    image: localImg("/PixVerse_Image_Effect_prompt_re-generate a top (2).png"),
  },
  {
    id: "lx-gilded-scarf",
    name: "Navy Bucket Hat",
    price: 96,
    category: "accessory",
    tags: ["day", "editorial"],
    image: localImg("/PixVerse_Image_Effect_prompt_re-generate a hat.png"),
  },
  {
    id: "lx-mono-bag",
    name: "Navy Cap",
    price: 285,
    category: "accessory",
    tags: ["day", "minimal"],
    image: localImg("/PixVerse_Image_Effect_prompt_re-generate a hat (2).png"),
  },
];

export const productById = new Map(products.map((p) => [p.id, p]));
