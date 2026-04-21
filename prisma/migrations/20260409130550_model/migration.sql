-- CreateEnum
CREATE TYPE "public"."PaiementMethode" AS ENUM ('WAVE', 'ORANGE_MONEY', 'MTN_MONEY', 'MOOV_MONEY', 'CARTE');

-- CreateEnum
CREATE TYPE "public"."PaiementProvider" AS ENUM ('WAVE', 'CINETPAY', 'STRIPE');

-- CreateEnum
CREATE TYPE "public"."PaiementStatut" AS ENUM ('EN_ATTENTE', 'EN_COURS', 'SUCCES', 'ECHEC', 'ANNULE', 'EXPIRE', 'REMBOURSE');

-- CreateEnum
CREATE TYPE "public"."PaiementType" AS ENUM ('ORDONNANCE', 'BON_COMMANDE', 'LIVRAISON');

-- CreateTable
CREATE TABLE "public"."Paiement" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "montantInitial" DECIMAL(10,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "methode" "public"."PaiementMethode" NOT NULL,
    "provider" "public"."PaiementProvider" NOT NULL,
    "statut" "public"."PaiementStatut" NOT NULL DEFAULT 'EN_ATTENTE',
    "referenceExterne" TEXT,
    "paymentUrl" TEXT,
    "signature" TEXT,
    "message" TEXT,
    "deletedAt" TIMESTAMP(3),
    "callbackAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "ordonnanceId" TEXT,
    "type" "public"."PaiementType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_transactionId_key" ON "public"."Paiement"("transactionId");

-- CreateIndex
CREATE INDEX "Paiement_userId_idx" ON "public"."Paiement"("userId");

-- CreateIndex
CREATE INDEX "Paiement_resourceId_idx" ON "public"."Paiement"("resourceId");

-- CreateIndex
CREATE INDEX "Paiement_transactionId_idx" ON "public"."Paiement"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."Paiement" ADD CONSTRAINT "Paiement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Paiement" ADD CONSTRAINT "Paiement_ordonnanceId_fkey" FOREIGN KEY ("ordonnanceId") REFERENCES "public"."Ordonnance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
