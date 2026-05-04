// src/app/api/clientbackend/paiement/paydunya/ipn

import { NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Type minimal pour éviter "any"
type PaydunyaIpnPayload = {
  invoice?: {
    token?: string;
    total_amount?: number | string;
    receipt_url?: string;
  };
  status?: string;
  response_code?: string;
  receipt_url?: string;
  hash?: string;
};

export async function POST(req: NextRequest) {
  console.log("🔥🔥🔥 IPN CALLED 🔥🔥🔥");

  try {
    // 🔥 1. Parsing robuste (JSON + form-data)
    let parsed: PaydunyaIpnPayload;

    try {
      const contentType = req.headers.get("content-type") || "";
      console.log("📦 Content-Type:", contentType);

      if (contentType.includes("application/json")) {
        parsed = (await req.json()) as PaydunyaIpnPayload;
      } else {
        const formData = await req.formData();
        const rawData = formData.get("data");

        if (!rawData || typeof rawData !== "string") {
          throw new Error("data introuvable");
        }

        console.log("📩 RAW DATA (form):", rawData);
        parsed = JSON.parse(rawData) as PaydunyaIpnPayload;
      }
    } catch (e) {
      console.error("❌ Parsing IPN impossible:", e);
      return new Response("Bad Request", { status: 400 });
    }

    console.log("✅ PARSED:", parsed);

    // 🔍 2. Token
    const token = parsed?.invoice?.token;

    if (!token) {
      console.error("❌ Token manquant");
      return new Response("Token manquant", { status: 400 });
    }

    console.log("🪙 TOKEN:", token);

    // 🔥 3. Vérification PayDunya (⚠️ SANDBOX)
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
      return new Response("Erreur PayDunya", { status: 500 });
    }

    const verifyData = (await verifyResponse.json()) as PaydunyaIpnPayload;

    console.log("✅ VERIFY PAYDUNYA:", verifyData);

    // 🔐 4. Validation PayDunya
    if (!verifyData || verifyData.response_code !== "00") {
      console.error("❌ Paiement non validé par PayDunya");
      return new Response("Paiement invalide", { status: 400 });
    }

    // 🔍 5. Retrouver paiement
    const paiement = await prisma.paiement.findFirst({
      where: { referenceExterne: token },
    });

    if (!paiement) {
      console.error("❌ Paiement introuvable");
      return new Response("Paiement introuvable", { status: 404 });
    }

    // 🛑 6. éviter double traitement
    if (paiement.statut === "SUCCES") {
      console.log("⚠️ Déjà traité");
      return new Response("Déjà traité", { status: 200 });
    }

    // 🔐 7. Vérification montant
    const montantDB = (paiement.montant as Prisma.Decimal).toNumber();
    const montantPaydunya = Number(verifyData?.invoice?.total_amount ?? 0);

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

    // 🔥 8. gestion des statuts
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
            statut: "SUCCES",
            receiptUrl,
            providerHash,
            rawData: verifyData as unknown as Prisma.InputJsonValue,
            callbackAt: new Date(),
          },
        });

        // 🔐 sécurité sur type
        if (paiement.type === "ORDONNANCE") {
          await prisma.ordonnance.update({
            where: { id: paiement.resourceId },
            data: { statut: "PAYEE" },
          });
        }

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
