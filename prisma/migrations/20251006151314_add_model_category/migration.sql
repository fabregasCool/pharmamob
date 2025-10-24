/*
  Warnings:

  - Added the required column `category` to the `Produit` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Category" AS ENUM ('MEDICAMENT', 'BEAUTE_HYGIENE', 'SANTE', 'COMPLEMENTS', 'NUTRITION', 'SEXUALITE', 'BEBE_MAMAN', 'BIEN_ETRE_DETENTE', 'BUCCO_DENTAIRE', 'DERMATOLOGIE', 'PREMIERS_SECOURS', 'VISION_ET_AUDITION', 'ORL', 'MATERIEL_MEDICAL', 'CHEVEUX');

-- AlterTable
ALTER TABLE "public"."Produit" ADD COLUMN     "category" "public"."Category" NOT NULL;
