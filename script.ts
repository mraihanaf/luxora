import { prisma } from "./lib/prisma";

async function main() {
  const product = await prisma.product.create({
    data: {
      type: "TOP",
      name: "Sample Product",
      description: null,
      imageKey: "products/sample/image.png",
      videoKey: null,
      priceIdr: 199000,
    },
  });
  console.log("Created product:", product);

  const allProducts = await prisma.product.findMany();
  console.log("All products:", JSON.stringify(allProducts, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
