-- AlterEnum
ALTER TYPE "public"."PaiementProvider" ADD VALUE 'PAYDUNYA';

-- AlterTable
ALTER TABLE "public"."Paiement" ADD COLUMN     "providerHash" TEXT,
ADD COLUMN     "rawData" JSONB,
ADD COLUMN     "receiptUrl" TEXT;
