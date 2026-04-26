//C'est cet api qui va permettre à dire à mon backend que le paiement est vraiement effectué
// /api/paydunya/ipn/route.ts
import { NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("🔔 IPN PAYDUNYA:", body);

    const token = body?.data?.token;

    if (!token) {
      return new Response("Token manquant", { status: 400 });
    }

    // 🔍 1. Vérification auprès de PayDunya (TRÈS IMPORTANT)
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

    const verifyData = await verifyResponse.json();

    console.log("✅ VERIFY PAYDUNYA:", verifyData);

    // 🔍 2. Retrouver le paiement
    const paiement = await prisma.paiement.findFirst({
      where: { referenceExterne: token },
    });

    if (!paiement) {
      return new Response("Paiement introuvable", { status: 404 });
    }

    // 🛑 3. Éviter double traitement
    if (paiement.statut === "SUCCES") {
      console.log("⚠️ Paiement déjà traité");
      return new Response("Déjà traité", { status: 200 });
    }

    // 🔐 4. Vérification montant (sécurité)

    const montantDB = (paiement.montant as Prisma.Decimal).toNumber();
    const montantPaydunya = Number(verifyData.invoice.total_amount);
    if (montantDB !== montantPaydunya) {
      console.error("❌ Montant incorrect !");
      return new Response("Montant invalide", { status: 400 });
    }

    //On recupère les status apportés par paydunya après le paiement
    const status = verifyData?.invoice?.status;

    if (!status) {
      console.error("❌ Status introuvable dans verifyData");
      return new Response("Status invalide", { status: 400 });
    }

    // 🔥 5. Gestion des statuts
    if (verifyData.response_code !== "00") {
      console.error("❌ Paiement non validé par PayDunya");
      return new Response("Paiement invalide", { status: 400 });
    }

    switch (status) {
      case "completed":
        console.log("✅ Paiement réussi");

        await prisma.paiement.update({
          where: { id: paiement.id },
          data: {
            statut: "SUCCES",
            rawData: verifyData,
            callbackAt: new Date(),
          },
        });

        // ✅ Mettre ordonnance PAYEE
        await prisma.ordonnance.update({
          where: { id: paiement.resourceId },
          data: { statut: "PAYEE" },
        });

        break;
      case "pending":
        console.log("⏳ Toujours en attente");

        await prisma.paiement.update({
          where: { id: paiement.id },
          data: { statut: "EN_COURS" }, // ou EN_ATTENTE
        });
        break;

      case "cancelled":
        console.log("❌ Paiement annulé");

        await prisma.paiement.update({
          where: { id: paiement.id },
          data: {
            statut: "ANNULE",
          },
        });

        break;

      default:
        console.log("⚠️ Statut inconnu:", status);
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ ERREUR IPN:", error);
    return new Response("Erreur serveur", { status: 500 });
  }
}
