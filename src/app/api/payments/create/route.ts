import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createJekoPaymentRequest } from "@/lib/jeko";
// import { createPaydunyaInvoice } from "@/lib/paydunya"; // à brancher plus tard

export async function POST(req: NextRequest) {
  const { provider, type, resourceId, montant, userId, paymentMethod } =
    await req.json();
  // type: "ORDONNANCE" | "BON_COMMANDE" | "LIVRAISON"
  // resourceId: id de l'Ordonnance ou du Bondecommande concerné

  const reference = `${type}-${resourceId}-${Date.now()}`;

  if (provider === "jeko") {
    const jekoRes = await createJekoPaymentRequest({
      amountCents: montant * 100,
      reference,
      paymentMethod,
    });

    const paiement = await prisma.paiementJeko.create({
      data: {
        reference,
        jekoPaymentRequestId: jekoRes.id,
        montant,
        montantInitial: montant,
        redirectUrl: jekoRes.redirectUrl,
        paymentMethod: paymentMethod?.toUpperCase(),
        statut: "PENDING",
        rawCreateResponse: jekoRes,
        userId,
        type,
        resourceId,
        ...(type === "ORDONNANCE" ? { ordonnanceId: resourceId } : {}),
        ...(type === "BON_COMMANDE" ? { bondecommandeId: resourceId } : {}),
      },
    });

    return Response.json({
      redirectUrl: jekoRes.redirectUrl,
      paiementId: paiement.id,
    });
  }

  if (provider === "paydunya") {
    // À brancher sur votre implémentation PayDunya existante (table Paiement)
    return Response.json(
      { error: "PayDunya pas encore implémenté" },
      { status: 501 },
    );
  }

  return Response.json({ error: "Provider inconnu" }, { status: 400 });
}
