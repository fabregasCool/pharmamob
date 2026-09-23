// app/api/payments/create/route.ts
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createJekoPaymentRequest } from "@/lib/jeko";
import { getUserFromRequest } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user)
      return Response.json({ error: "Non authentifié" }, { status: 401 });

    const { provider, type, resourceId, paymentMethod } = await req.json();

    if (type !== "ORDONNANCE") {
      return Response.json(
        { error: "Type non supporté pour le moment" },
        { status: 400 },
      );
    }
    if (!resourceId) {
      return Response.json({ error: "resourceId manquant" }, { status: 400 });
    }

    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: resourceId },
    });
    if (!ordonnance) {
      return Response.json(
        { error: "Ordonnance introuvable" },
        { status: 404 },
      );
    }
    if (!ordonnance.prixTotal) {
      return Response.json(
        { error: "Le devis n'a pas encore de prix" },
        { status: 400 },
      );
    }
    if (ordonnance.statut !== "DEVIS_VALIDEE_PAR_CLIENT") {
      return Response.json(
        { error: "Le devis doit être validé avant paiement" },
        { status: 400 },
      );
    }

    const total = Number(ordonnance.prixTotal);
    const fraisService = Math.round(total * 0.1);
    const montant = total + fraisService;

    if (!montant || Number.isNaN(montant) || montant <= 0) {
      console.error("❌ Montant invalide calculé:", {
        total,
        fraisService,
        montant,
        prixTotal: ordonnance.prixTotal,
      });
      return Response.json(
        { error: "Montant invalide, impossible de créer le paiement" },
        { status: 400 },
      );
    }

    const amountCents = Math.round(montant * 100);
    console.log("💰 Paiement à créer:", { amountCents, montant });

    const amount = Math.round(montant); // XOF n'a pas de sous-unité , c'est les frais de Jeko(1%)

    const reference = `ORDONNANCE-${resourceId}-${Date.now()}`;

    if (provider === "jeko") {
      const jekoRes = await createJekoPaymentRequest({
        amountCents: amount,
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
          paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : null,
          statut: "PENDING",
          rawCreateResponse: jekoRes,
          userId: user.id,
          type: "ORDONNANCE",
          resourceId,
          ordonnanceId: resourceId,
        },
      });

      return Response.json({
        redirectUrl: jekoRes.redirectUrl,
        paiementId: paiement.id,
      });
    }

    if (provider === "paydunya") {
      return Response.json(
        { error: "PayDunya pas encore implémenté" },
        { status: 501 },
      );
    }

    return Response.json({ error: "Provider inconnu" }, { status: 400 });
  } catch (err) {
    console.error("❌ Erreur /api/payments/create:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Erreur interne" },
      { status: 500 },
    );
  }
}
