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

    // 🔥 données venant DIRECTEMENT de l’IPN
    const token = parsed?.invoice?.token;
    const ipnStatus = parsed?.status;

    console.log("🪙 TOKEN:", token);
    console.log("📊 IPN STATUS:", ipnStatus);

    if (!token) {
      return new Response("Token manquant", { status: 400 });
    }

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

    const verifyData = await verifyResponse.json();

    console.log("✅ VERIFY PAYDUNYA:", verifyData);

    // 🔍 2. Retrouver le paiement
    const paiement = await prisma.paiement.findFirst({
      where: { referenceExterne: token },
    });

    if (!paiement) {
      return new Response("Paiement introuvable", { status: 404 });
    }

    // 🛑 3. éviter double traitement
    if (paiement.statut === "SUCCES") {
      console.log("⚠️ Paiement déjà traité");
      return new Response("Déjà traité", { status: 200 });
    }

    // 🔐 4. vérifier montant
    const montantDB = (paiement.montant as Prisma.Decimal).toNumber();
    const montantPaydunya = Number(verifyData?.invoice?.total_amount);

    if (montantDB !== montantPaydunya) {
      console.error("❌ Montant incorrect !");
      return new Response("Montant invalide", { status: 400 });
    }

    // 🔐 5. vérifier réponse PayDunya
    if (verifyData.response_code !== "00") {
      console.error("❌ Paiement non validé par PayDunya");
      return new Response("Paiement invalide", { status: 400 });
    }

    const verifyStatus = verifyData?.status;

    if (!verifyStatus) {
      console.error("❌ Status introuvable");
      return new Response("Status invalide", { status: 400 });
    }

    // 🔥 6. gestion des statuts
    switch (verifyStatus) {
      case "completed":
        console.log("✅ Paiement réussi");

        // 🔥 a. sauvegarder toutes les données
        await prisma.paiement.update({
          where: { id: paiement.id },
          data: {
            statut: "SUCCES",
            rawData: verifyData,
            callbackAt: new Date(),
          },
        });

        // 🔥 b. relire depuis PostgreSQL
        const paiementUpdated = await prisma.paiement.findUnique({
          where: { id: paiement.id },
          select: {
            rawData: true,
          },
        });

        // 🔥 c. caster le JSON
        const raw = paiementUpdated?.rawData as Prisma.JsonObject;

        // 🔥 d. extraire les valeurs
        const receiptUrl =
          typeof raw?.receipt_url === "string" ? raw.receipt_url : null;

        const providerHash = typeof raw?.hash === "string" ? raw.hash : null;

        console.log("🧾 RECEIPT:", receiptUrl);
        console.log("🔐 HASH:", providerHash);

        // 🔥 e. mise à jour finale
        await prisma.paiement.update({
          where: { id: paiement.id },
          data: {
            receiptUrl,
            providerHash,
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
