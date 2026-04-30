import { NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ type minimal pour ton IPN
type PaydunyaIPN = {
  hash?: string;
  status?: string;
  receipt_url?: string;
  invoice?: {
    token?: string;
    total_amount?: number;
  };
};

export async function POST(req: NextRequest) {
  try {
    let parsed: PaydunyaIPN | null = null;
    let rawData: string | null = null;

    // 🔥 1. Essai JSON brut
    try {
      const body = await req.text();
      console.log("📩 BODY BRUT:", body);

      if (body) {
        parsed = JSON.parse(body) as PaydunyaIPN;
        rawData = body;
      }
    } catch {
      console.log("⚠️ Pas du JSON, fallback formData");
    }

    // 🔁 2. Fallback formData
    if (!parsed) {
      const formData = await req.formData();
      const data = formData.get("data");

      if (!data || typeof data !== "string") {
        console.error("❌ data introuvable");
        return new Response("Bad Request", { status: 400 });
      }

      try {
        parsed = JSON.parse(data) as PaydunyaIPN;
      } catch {
        console.error("❌ JSON invalide");
        return new Response("Invalid JSON", { status: 400 });
      }
    }

    console.log("📦 PARSED:", parsed);

    const token = parsed?.invoice?.token;
    const ipnStatus = parsed?.status;

    console.log("🪙 TOKEN:", token);
    console.log("📊 IPN STATUS:", ipnStatus);

    if (!token) {
      return new Response("Token manquant", { status: 400 });
    }

    // 🔍 Vérification PayDunya
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

    const paiement = await prisma.paiement.findFirst({
      where: { referenceExterne: token },
    });

    if (!paiement) {
      return new Response("Paiement introuvable", { status: 404 });
    }

    if (paiement.statut === "SUCCES") {
      console.log("⚠️ Déjà traité");
      return new Response("OK", { status: 200 });
    }

    // 🔐 Vérification montant
    const montantDB = (paiement.montant as Prisma.Decimal).toNumber();
    const montantPaydunya = Number(verifyData?.invoice?.total_amount);

    if (montantDB !== montantPaydunya) {
      return new Response("Montant invalide", { status: 400 });
    }

    if (verifyData.response_code !== "00") {
      return new Response("Paiement invalide", { status: 400 });
    }

    const verifyStatus = verifyData?.status;

    switch (verifyStatus) {
      case "completed":
        console.log("✅ Paiement réussi");

        const providerHash =
          parsed?.hash || req.headers.get("x-paydunya-signature");

        const receiptUrl = parsed?.receipt_url ?? null;

        console.log("🧾 receiptUrl:", receiptUrl);

        await prisma.$transaction([
          prisma.paiement.update({
            where: { id: paiement.id },
            data: {
              statut: "SUCCES",
              receiptUrl,
              providerHash: providerHash ?? null,
              callbackAt: new Date(),
              rawData: {
                ipn: parsed,
                verify: verifyData,
              },
            },
          }),

          prisma.ordonnance.update({
            where: { id: paiement.resourceId },
            data: { statut: "PAYEE" },
          }),
        ]);

        break;

      case "pending":
        await prisma.paiement.update({
          where: { id: paiement.id },
          data: { statut: "EN_COURS" },
        });
        break;

      case "cancelled":
        await prisma.paiement.update({
          where: { id: paiement.id },
          data: { statut: "ANNULE" },
        });
        break;

      case "failed":
        await prisma.paiement.update({
          where: { id: paiement.id },
          data: { statut: "ECHEC" },
        });
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("❌ ERREUR IPN:", error);
    return new Response("Erreur serveur", { status: 500 });
  }
}
