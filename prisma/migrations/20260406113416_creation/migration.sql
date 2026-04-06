-- AlterEnum
ALTER TYPE "public"."BondecommandeStatut" ADD VALUE 'DEVIS_VALIDEE_PAR_CLIENT';

-- CreateTable
CREATE TABLE "public"."BondecommandeItem" (
    "id" TEXT NOT NULL,
    "bondecommandeId" TEXT NOT NULL,
    "produitId" TEXT,
    "nomProduit" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BondecommandeItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BondecommandeItem_bondecommandeId_idx" ON "public"."BondecommandeItem"("bondecommandeId");

-- AddForeignKey
ALTER TABLE "public"."BondecommandeItem" ADD CONSTRAINT "BondecommandeItem_bondecommandeId_fkey" FOREIGN KEY ("bondecommandeId") REFERENCES "public"."Bondecommande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BondecommandeItem" ADD CONSTRAINT "BondecommandeItem_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "public"."Produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
