-- CreateEnum
CREATE TYPE "public"."BondecommandeStatut" AS ENUM ('ENVOYEE', 'EN_COURS', 'PRET', 'LIVREE', 'ANNULEE');

-- CreateTable
CREATE TABLE "public"."Bondecommande" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT,
    "securite_sociale" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "statut" "public"."BondecommandeStatut" NOT NULL DEFAULT 'ENVOYEE',
    "prixTotal" DECIMAL(10,2),
    "pharmacieId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bondecommande_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bondecommande_userId_idx" ON "public"."Bondecommande"("userId");

-- CreateIndex
CREATE INDEX "Bondecommande_pharmacieId_idx" ON "public"."Bondecommande"("pharmacieId");

-- CreateIndex
CREATE INDEX "Bondecommande_statut_idx" ON "public"."Bondecommande"("statut");

-- AddForeignKey
ALTER TABLE "public"."Bondecommande" ADD CONSTRAINT "Bondecommande_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bondecommande" ADD CONSTRAINT "Bondecommande_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "public"."Pharmacie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
