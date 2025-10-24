/*
  Warnings:

  - The values [ANNULEE_PAR_BOUTIQUE] on the enum `CommandeStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [BOUTIQUE] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `boutiqueId` on the `Commande` table. All the data in the column will be lost.
  - You are about to drop the column `boutiqueId` on the `Produit` table. All the data in the column will be lost.
  - You are about to drop the `Boutique` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pharmacieId` to the `Commande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pharmacieId` to the `Produit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."CommandeStatus_new" AS ENUM ('EN_ATTENTE', 'PUBLIER_AUX_LIVREURS', 'EN_COURS', 'LIVREE', 'ANNULEE_PAR_PHARMACIE', 'ANNULEE_PAR_LIVREUR');
ALTER TABLE "public"."Commande" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."Commande" ALTER COLUMN "status" TYPE "public"."CommandeStatus_new" USING ("status"::text::"public"."CommandeStatus_new");
ALTER TYPE "public"."CommandeStatus" RENAME TO "CommandeStatus_old";
ALTER TYPE "public"."CommandeStatus_new" RENAME TO "CommandeStatus";
DROP TYPE "public"."CommandeStatus_old";
ALTER TABLE "public"."Commande" ALTER COLUMN "status" SET DEFAULT 'EN_ATTENTE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('ADMIN', 'PHARMACIE', 'LIVREUR', 'CLIENT');
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Boutique" DROP CONSTRAINT "Boutique_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Commande" DROP CONSTRAINT "Commande_boutiqueId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Produit" DROP CONSTRAINT "Produit_boutiqueId_fkey";

-- AlterTable
ALTER TABLE "public"."Commande" DROP COLUMN "boutiqueId",
ADD COLUMN     "pharmacieId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Produit" DROP COLUMN "boutiqueId",
ADD COLUMN     "pharmacieId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Boutique";

-- CreateTable
CREATE TABLE "public"."Pharmacie" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ville" TEXT,
    "commune" TEXT,
    "quartier" TEXT,
    "phone" TEXT,
    "logo" TEXT,
    "slogan" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pharmacie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "adresse" TEXT,
    "ville" TEXT,
    "commune" TEXT,
    "quartier" TEXT,
    "phone" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacie_name_key" ON "public"."Pharmacie"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "public"."Client"("userId");

-- AddForeignKey
ALTER TABLE "public"."Pharmacie" ADD CONSTRAINT "Pharmacie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Produit" ADD CONSTRAINT "Produit_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "public"."Pharmacie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Commande" ADD CONSTRAINT "Commande_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "public"."Pharmacie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
