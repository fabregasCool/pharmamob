/*
  Warnings:

  - The values [VALIDEE_PAR_CLIENT] on the enum `OrdonnanceStatut` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."OrdonnanceStatut_new" AS ENUM ('ENVOYEE', 'DEVIS_RECU', 'DEVIS_VALIDEE_PAR_CLIENT', 'PRET', 'LIVREE', 'ANNULEE');
ALTER TABLE "public"."Ordonnance" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "public"."Ordonnance" ALTER COLUMN "statut" TYPE "public"."OrdonnanceStatut_new" USING ("statut"::text::"public"."OrdonnanceStatut_new");
ALTER TYPE "public"."OrdonnanceStatut" RENAME TO "OrdonnanceStatut_old";
ALTER TYPE "public"."OrdonnanceStatut_new" RENAME TO "OrdonnanceStatut";
DROP TYPE "public"."OrdonnanceStatut_old";
ALTER TABLE "public"."Ordonnance" ALTER COLUMN "statut" SET DEFAULT 'ENVOYEE';
COMMIT;
