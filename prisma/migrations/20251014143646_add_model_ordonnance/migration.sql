-- CreateEnum
CREATE TYPE "public"."OrdonnanceStatut" AS ENUM ('ENVOYEE', 'EN_COURS', 'PRET', 'LIVREE', 'ANNULEE');

-- CreateTable
CREATE TABLE "public"."Ordonnance" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "statut" "public"."OrdonnanceStatut" NOT NULL DEFAULT 'ENVOYEE',
    "prixTotal" DECIMAL(10,2),
    "pharmacieId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ordonnance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ordonnance_userId_idx" ON "public"."Ordonnance"("userId");

-- CreateIndex
CREATE INDEX "Ordonnance_pharmacieId_idx" ON "public"."Ordonnance"("pharmacieId");

-- CreateIndex
CREATE INDEX "Ordonnance_statut_idx" ON "public"."Ordonnance"("statut");

-- AddForeignKey
ALTER TABLE "public"."Ordonnance" ADD CONSTRAINT "Ordonnance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ordonnance" ADD CONSTRAINT "Ordonnance_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "public"."Pharmacie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
