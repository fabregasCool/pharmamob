-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."BondecommandeStatut" ADD VALUE 'PAYEE';
ALTER TYPE "public"."BondecommandeStatut" ADD VALUE 'EN_LIVRAISON';

-- AlterTable
ALTER TABLE "public"."Paiement" ADD COLUMN     "bondecommandeId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Paiement" ADD CONSTRAINT "Paiement_bondecommandeId_fkey" FOREIGN KEY ("bondecommandeId") REFERENCES "public"."Bondecommande"("id") ON DELETE SET NULL ON UPDATE CASCADE;
