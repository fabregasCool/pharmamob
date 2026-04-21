/*
  Warnings:

  - The values [WAVE] on the enum `PaiementProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PaiementProvider_new" AS ENUM ('CINETPAY', 'STRIPE');
ALTER TABLE "public"."Paiement" ALTER COLUMN "provider" TYPE "public"."PaiementProvider_new" USING ("provider"::text::"public"."PaiementProvider_new");
ALTER TYPE "public"."PaiementProvider" RENAME TO "PaiementProvider_old";
ALTER TYPE "public"."PaiementProvider_new" RENAME TO "PaiementProvider";
DROP TYPE "public"."PaiementProvider_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Paiement" ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "failureUrl" TEXT,
ADD COLUMN     "notifyUrl" TEXT,
ADD COLUMN     "successUrl" TEXT;
