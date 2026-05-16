/*
  Warnings:

  - You are about to drop the column `numeroArticle` on the `Ordonnance` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Ordonnance" DROP COLUMN "numeroArticle";

-- AlterTable
ALTER TABLE "public"."OrdonnanceItem" ADD COLUMN     "numeroArticle" INTEGER;
