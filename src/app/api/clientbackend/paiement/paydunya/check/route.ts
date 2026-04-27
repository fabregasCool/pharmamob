//src/api/clientbackend/paiement/paydunya/check
import { NextRequest } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return Response.json({ error: "Token manquant" }, { status: 400 });
    }

    // 🔍 1. Vérifier chez PayDunya
    const res = await fetch(
      `https://app.paydunya.com/sandbox-api/v1/checkout-invoice/confirm/${token}`,
      {
        headers: {
          "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY!,
          "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY!,
          "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN!,
        },
      },
    );

    const data = await res.json();

    console.log("🔍 CHECK PAYDUNYA:", data);

    // 🔐 2. Vérifier réponse PayDunya
    if (data.response_code !== "00") {
      console.error("❌ Réponse PayDunya invalide");
      return Response.json({ error: "Paiement invalide" }, { status: 400 });
    }

    // 🔍 3. retrouver paiement
    const paiement = await prisma.paiement.findFirst({
      where: { referenceExterne: token },
    });

    if (!paiement) {
      return Response.json({ error: "Paiement introuvable" }, { status: 404 });
    }

    // 🛑 4. éviter double traitement
    if (paiement.statut === "SUCCES") {
      return Response.json({ message: "Déjà traité", data });
    }

    // 🔐 5. vérifier montant
    const montantDB = (paiement.montant as Prisma.Decimal).toNumber();
    const montantPaydunya = Number(data?.invoice?.total_amount);

    if (montantDB !== montantPaydunya) {
      console.error("❌ Montant incorrect !");
      return Response.json({ error: "Montant invalide" }, { status: 400 });
    }

    const status = data?.status;

    if (!status) {
      return Response.json({ error: "Status invalide" }, { status: 400 });
    }

    // 🔥 6. gestion des statuts
    switch (status) {
      case "completed":
        console.log("✅ Paiement réussi");

        await prisma.paiement.update({
          where: { id: paiement.id },
          data: {
            statut: "SUCCES",
            rawData: data,
            callbackAt: new Date(),
          },
        });

        await prisma.ordonnance.update({
          where: { id: paiement.resourceId },
          data: { statut: "PAYEE" },
        });

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
    }

    return Response.json(data);
  } catch (error) {
    console.error("❌ ERREUR CHECK:", error);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
