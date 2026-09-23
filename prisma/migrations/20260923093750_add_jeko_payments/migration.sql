-- CreateEnum
CREATE TYPE "public"."JekoPaiementStatut" AS ENUM ('PENDING', 'SUCCESS', 'ERROR', 'EXPIRE');

-- CreateEnum
CREATE TYPE "public"."JekoPaymentMethod" AS ENUM ('WAVE', 'ORANGE', 'MTN', 'MOOV', 'DJAMO', 'CARTE');

-- CreateTable
CREATE TABLE "public"."PaiementJeko" (
    "id" TEXT NOT NULL,
    "jekoPaymentRequestId" TEXT,
    "reference" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "montantInitial" DECIMAL(10,2) NOT NULL,
    "devise" TEXT NOT NULL DEFAULT 'XOF',
    "paymentMethod" "public"."JekoPaymentMethod",
    "statut" "public"."JekoPaiementStatut" NOT NULL DEFAULT 'PENDING',
    "redirectUrl" TEXT,
    "successUrl" TEXT,
    "errorUrl" TEXT,
    "transactionId" TEXT,
    "counterpartLabel" TEXT,
    "counterpartIdentifier" TEXT,
    "errorReason" TEXT,
    "fraisJeko" DECIMAL(10,2),
    "rawCreateResponse" JSONB,
    "rawWebhookData" JSONB,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "callbackAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "ordonnanceId" TEXT,
    "bondecommandeId" TEXT,
    "type" "public"."PaiementType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaiementJeko_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaiementJeko_jekoPaymentRequestId_key" ON "public"."PaiementJeko"("jekoPaymentRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "PaiementJeko_reference_key" ON "public"."PaiementJeko"("reference");

-- CreateIndex
CREATE INDEX "PaiementJeko_userId_idx" ON "public"."PaiementJeko"("userId");

-- CreateIndex
CREATE INDEX "PaiementJeko_resourceId_idx" ON "public"."PaiementJeko"("resourceId");

-- CreateIndex
CREATE INDEX "PaiementJeko_reference_idx" ON "public"."PaiementJeko"("reference");

-- CreateIndex
CREATE INDEX "PaiementJeko_jekoPaymentRequestId_idx" ON "public"."PaiementJeko"("jekoPaymentRequestId");

-- CreateIndex
CREATE INDEX "PaiementJeko_statut_idx" ON "public"."PaiementJeko"("statut");

-- AddForeignKey
ALTER TABLE "public"."PaiementJeko" ADD CONSTRAINT "PaiementJeko_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaiementJeko" ADD CONSTRAINT "PaiementJeko_ordonnanceId_fkey" FOREIGN KEY ("ordonnanceId") REFERENCES "public"."Ordonnance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaiementJeko" ADD CONSTRAINT "PaiementJeko_bondecommandeId_fkey" FOREIGN KEY ("bondecommandeId") REFERENCES "public"."Bondecommande"("id") ON DELETE SET NULL ON UPDATE CASCADE;
