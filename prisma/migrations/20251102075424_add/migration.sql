-- AlterTable
ALTER TABLE "public"."Bondecommande" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Ordonnance" ADD COLUMN     "deletedAt" TIMESTAMP(3);
