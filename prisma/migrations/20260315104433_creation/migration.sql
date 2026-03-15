-- AlterEnum
ALTER TYPE "public"."OrdonnanceStatut" ADD VALUE 'VALIDEE_PAR_CLIENT';

-- CreateTable
CREATE TABLE "public"."OrdonnanceItem" (
    "id" TEXT NOT NULL,
    "ordonnanceId" TEXT NOT NULL,
    "produitId" TEXT,
    "nomProduit" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdonnanceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrdonnanceItem_ordonnanceId_idx" ON "public"."OrdonnanceItem"("ordonnanceId");

-- AddForeignKey
ALTER TABLE "public"."OrdonnanceItem" ADD CONSTRAINT "OrdonnanceItem_ordonnanceId_fkey" FOREIGN KEY ("ordonnanceId") REFERENCES "public"."Ordonnance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrdonnanceItem" ADD CONSTRAINT "OrdonnanceItem_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "public"."Produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
