// src/app/api/clientbackend/paiement/paydunya/ipn

import { NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const rawData = formData.get("data");

    if (!rawData || typeof rawData !== "string") {
      console.error("❌ data introuvable");
      return new Response("Bad Request", { status: 400 });
    }

    console.log("📩 RAW DATA:", rawData);

    let parsed;

    try {
      parsed = JSON.parse(rawData);
    } catch {
      console.error("❌ JSON invalide:", rawData);
      return new Response("Invalid JSON", { status: 400 });
    }

    const token = parsed?.invoice?.token;

    if (!token) {
      console.error("❌ Token manquant");
      return new Response("Token manquant", { status: 400 });
    }

    console.log("🪙 TOKEN:", token);

    // 🔍 1. Vérification auprès de PayDunya (COMME /check)
    const verifyResponse = await fetch(
      `https://app.paydunya.com/api/v1/checkout-invoice/confirm/${token}`, // 🔥 PROD
      {
        method: "GET",
        headers: {
          "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY!,
          "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY!,
          "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN!,
        },
      },
    );

    if (!verifyResponse.ok) {
      console.error("❌ HTTP ERROR PAYDUNYA:", verifyResponse.status);
      return new Response("Erreur PayDunya", { status: 500 });
    }

    const verifyData = await verifyResponse.json();

    console.log("✅ VERIFY PAYDUNYA:", verifyData);

    // 🔐 2. Vérifier réponse PayDunya
    if (!verifyData || verifyData.response_code !== "00") {
      console.error("❌ Paiement non validé par PayDunya");
      return new Response("Paiement invalide", { status: 400 });
    }

    // 🔍 3. Retrouver le paiement
    const paiement = await prisma.paiement.findFirst({
      where: { referenceExterne: token },
    });

    if (!paiement) {
      console.error("❌ Paiement introuvable");
      return new Response("Paiement introuvable", { status: 404 });
    }

    // 🛑 4. éviter double traitement
    if (paiement.statut === "SUCCES") {
      console.log("⚠️ Déjà traité");
      return new Response("Déjà traité", { status: 200 });
    }

    // 🔐 5. Vérification montant (IDENTIQUE /check)
    const montantDB = (paiement.montant as Prisma.Decimal).toNumber();
    const montantPaydunya = Number(verifyData?.invoice?.total_amount);

    if (montantDB !== montantPaydunya) {
      console.error("❌ Montant incorrect !");
      return new Response("Montant invalide", { status: 400 });
    }

    const verifyStatus = verifyData?.status;

    if (!verifyStatus) {
      console.error("❌ Status introuvable");
      return new Response("Status invalide", { status: 400 });
    }

    console.log("📊 STATUS:", verifyStatus);

    // 🔥 6. gestion des statuts (ALIGNÉ AVEC /check)
    switch (verifyStatus) {
      case "completed":
        console.log("✅ Paiement réussi");

        const receiptUrl =
          verifyData?.receipt_url ?? verifyData?.invoice?.receipt_url ?? null;

        const providerHash =
          verifyData?.hash || req.headers.get("x-paydunya-signature") || null;

        console.log("🧾 receiptUrl:", receiptUrl);
        console.log("🔐 providerHash:", providerHash);

        await prisma.paiement.update({
          where: { id: paiement.id },
          data: {
            statut: "SUCCES", // ✅ CORRIGÉ (et pas REMBOURSE)
            receiptUrl,
            providerHash,
            rawData: verifyData,
            callbackAt: new Date(),
          },
        });

        await prisma.ordonnance.update({
          where: { id: paiement.resourceId },
          data: { statut: "PAYEE" },
        });

        break;

      case "pending":
        console.log("⏳ En attente");

        await prisma.paiement.update({
          where: { id: paiement.id },
          data: { statut: "EN_COURS" },
        });

        break;

      case "cancelled":
        console.log("❌ Annulé");

        await prisma.paiement.update({
          where: { id: paiement.id },
          data: { statut: "ANNULE" },
        });

        break;

      case "failed":
        console.log("❌ Échoué");

        await prisma.paiement.update({
          where: { id: paiement.id },
          data: { statut: "ECHEC" },
        });

        break;

      default:
        console.log("⚠️ Statut inconnu:", verifyStatus);
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ ERREUR IPN:", error);
    return new Response("Erreur serveur", { status: 500 });
  }
}
