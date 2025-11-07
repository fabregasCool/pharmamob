/*
  Warnings:

  - The values [EN_COURS] on the enum `BondecommandeStatut` will be removed. If these variants are still used in the database, this will fail.
  - The values [EN_COURS] on the enum `OrdonnanceStatut` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BondecommandeStatut_new" AS ENUM ('ENVOYEE', 'DEVIS_RECU', 'PRET', 'LIVREE', 'ANNULEE');
ALTER TABLE "public"."Bondecommande" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "public"."Bondecommande" ALTER COLUMN "statut" TYPE "public"."BondecommandeStatut_new" USING ("statut"::text::"public"."BondecommandeStatut_new");
ALTER TYPE "public"."BondecommandeStatut" RENAME TO "BondecommandeStatut_old";
ALTER TYPE "public"."BondecommandeStatut_new" RENAME TO "BondecommandeStatut";
DROP TYPE "public"."BondecommandeStatut_old";
ALTER TABLE "public"."Bondecommande" ALTER COLUMN "statut" SET DEFAULT 'ENVOYEE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrdonnanceStatut_new" AS ENUM ('ENVOYEE', 'DEVIS_RECU', 'PRET', 'LIVREE', 'ANNULEE');
ALTER TABLE "public"."Ordonnance" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "public"."Ordonnance" ALTER COLUMN "statut" TYPE "public"."OrdonnanceStatut_new" USING ("statut"::text::"public"."OrdonnanceStatut_new");
ALTER TYPE "public"."OrdonnanceStatut" RENAME TO "OrdonnanceStatut_old";
ALTER TYPE "public"."OrdonnanceStatut_new" RENAME TO "OrdonnanceStatut";
DROP TYPE "public"."OrdonnanceStatut_old";
ALTER TABLE "public"."Ordonnance" ALTER COLUMN "statut" SET DEFAULT 'ENVOYEE';
COMMIT;

-- CreateTable
CREATE TABLE "public"."Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceSnapshot" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "public"."Cart"("userId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "public"."CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_produitId_idx" ON "public"."CartItem"("produitId");

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "public"."Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "public"."Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
