-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('TOP', 'BOTTOM', 'HEADWEAR');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageKey" TEXT NOT NULL,
    "videoKey" TEXT,
    "priceIdr" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVideo" (
    "id" TEXT NOT NULL,
    "productsHash" TEXT NOT NULL,
    "videoKey" TEXT,
    "videoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductToProductVideo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductToProductVideo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVideo_productsHash_key" ON "ProductVideo"("productsHash");

-- CreateIndex
CREATE INDEX "ProductVideo_productsHash_idx" ON "ProductVideo"("productsHash");

-- CreateIndex
CREATE INDEX "_ProductToProductVideo_B_index" ON "_ProductToProductVideo"("B");

-- AddForeignKey
ALTER TABLE "_ProductToProductVideo" ADD CONSTRAINT "_ProductToProductVideo_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductVideo" ADD CONSTRAINT "_ProductToProductVideo_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
