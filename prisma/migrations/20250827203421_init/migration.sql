-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'BOUTIQUE', 'LIVREUR');

-- CreateEnum
CREATE TYPE "public"."TokenType" AS ENUM ('REFRESH', 'VERIFICATION', 'PASSWORD_RESET', 'OAUTH');

-- CreateEnum
CREATE TYPE "public"."CommandeStatus" AS ENUM ('EN_ATTENTE', 'PUBLIER_AUX_LIVREURS', 'EN_COURS', 'LIVREE', 'ANNULEE_PAR_BOUTIQUE', 'ANNULEE_PAR_LIVREUR');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Otp" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Token" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "type" "public"."TokenType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Boutique" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ville" TEXT,
    "commune" TEXT,
    "quartier" TEXT,
    "phone" TEXT,
    "logo" TEXT,
    "slogan" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Boutique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Livreur" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "ville" TEXT,
    "commune" TEXT,
    "quartier" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Livreur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Produit" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "prix" INTEGER NOT NULL,
    "boutiqueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Commande" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "boutiqueId" TEXT NOT NULL,
    "livreurId" TEXT,
    "status" "public"."CommandeStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "adresseLivraison" TEXT,
    "telephoneClient" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "takenAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "instructionsLivraison" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE INDEX "Otp_userId_idx" ON "public"."Otp"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_email_token_key" ON "public"."Token"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Boutique_name_key" ON "public"."Boutique"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Livreur_userId_key" ON "public"."Livreur"("userId");

-- AddForeignKey
ALTER TABLE "public"."Otp" ADD CONSTRAINT "Otp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Boutique" ADD CONSTRAINT "Boutique_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Livreur" ADD CONSTRAINT "Livreur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Produit" ADD CONSTRAINT "Produit_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "public"."Boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Commande" ADD CONSTRAINT "Commande_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "public"."Produit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Commande" ADD CONSTRAINT "Commande_boutiqueId_fkey" FOREIGN KEY ("boutiqueId") REFERENCES "public"."Boutique"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Commande" ADD CONSTRAINT "Commande_livreurId_fkey" FOREIGN KEY ("livreurId") REFERENCES "public"."Livreur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
