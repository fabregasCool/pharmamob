// src/api/clientbackend/paiement/paydunya/check

import { NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      console.error("❌ Token manquant");
      return Response.json({ error: "Token manquant" }, { status: 400 });
    }

    console.log("🪙 TOKEN CHECK:", token);

    // 🔍 1. Vérification auprès de PayDunya
    const verifyResponse = await fetch(
      `https://app.paydunya.com/sandbox-api/v1/checkout-invoice/confirm/${token}`,
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
      return Response.json({ error: "Erreur PayDunya" }, { status: 500 });
    }

    const verifyData = await verifyResponse.json();

    console.log("✅ VERIFY PAYDUNYA:", verifyData);

    // 🔐 2. Vérifier réponse PayDunya
    if (!verifyData || verifyData.response_code !== "00") {
      console.error("❌ Paiement non validé par PayDunya");
      return Response.json({ error: "Paiement invalide" }, { status: 400 });
    }

    // 🔍 3. Retrouver le paiement
    const paiement = await prisma.paiement.findFirst({
      where: { referenceExterne: token },
    });

    if (!paiement) {
      console.error("❌ Paiement introuvable");
      return Response.json({ error: "Paiement introuvable" }, { status: 404 });
    }

    // 🛑 4. éviter double traitement
    if (paiement.statut === "SUCCES") {
      console.log("⚠️ Déjà traité");
      return Response.json({ message: "Déjà traité", data: verifyData });
    }

    // 🔐 5. Vérification montant
    const montantDB = (paiement.montant as Prisma.Decimal).toNumber();
    const montantPaydunya = Number(verifyData?.invoice?.total_amount);

    if (montantDB !== montantPaydunya) {
      console.error("❌ Montant incorrect !");
      return Response.json({ error: "Montant invalide" }, { status: 400 });
    }

    const verifyStatus = verifyData?.status;

    if (!verifyStatus) {
      console.error("❌ Status introuvable");
      return Response.json({ error: "Status invalide" }, { status: 400 });
    }

    console.log("📊 STATUS:", verifyStatus);

    // 🔥 6. gestion des statuts (IDENTIQUE À IPN)
    switch (verifyStatus) {
      case "completed":
        console.log("✅ Paiement réussi");

        // 🔥 récupérer depuis verifyData (LA BONNE SOURCE)
        const receiptUrl =
          verifyData?.receipt_url ?? verifyData?.invoice?.receipt_url ?? null;

        const providerHash =
          verifyData?.hash || req.headers.get("x-paydunya-signature") || null;

        console.log("🧾 receiptUrl:", receiptUrl);
        console.log("🔐 providerHash:", providerHash);

        await prisma.paiement.update({
          where: { id: paiement.id },
          data: {
            statut: "SUCCES",
            receiptUrl, // ✅ maintenant ça marche
            providerHash, // ✅ maintenant ça marche
            rawData: verifyData, // ou parsed + verify si tu veux
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

    return Response.json(verifyData);
  } catch (error) {
    console.error("❌ ERREUR CHECK:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
