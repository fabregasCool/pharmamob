// app/api/payments/status/route.ts
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("ref");

  if (!reference) {
    return Response.json({ error: "Référence manquante" }, { status: 400 });
  }

  const paiement = await prisma.paiementJeko.findUnique({
    where: { reference },
    select: {
      statut: true,
      montant: true,
      paymentMethod: true,
      errorReason: true,
      ordonnanceId: true,
      bondecommandeId: true,
    },
  });

  if (!paiement) {
    return Response.json({ error: "Paiement introuvable" }, { status: 404 });
  }

  return Response.json({ paiement });
}
