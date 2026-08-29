/*
  Warnings:

  - A unique constraint covering the columns `[trackingCode]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - The required column `trackingCode` was added to the `orders` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "trackingCode" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_trackingCode_key" ON "orders"("trackingCode");
