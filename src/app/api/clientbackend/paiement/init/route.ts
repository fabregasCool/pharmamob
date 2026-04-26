//api/clientbackend/paiement/init
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { createPaydunyaInvoice } from "@/lib/paydunya";

import {
  PrismaClient,
  User,
  PaiementMethode,
  PaiementProvider,
  PaiementType,
} from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { type, resourceId, methode, provider } = body as {
      type: PaiementType;
      resourceId: string;
      methode: PaiementMethode;
      provider: PaiementProvider;
    };

    let montant = 0;
    let user: User | null = null;

    // 🔍 1. récupérer la ressource
    if (type === "ORDONNANCE") {
      const ordonnance = await prisma.ordonnance.findUnique({
        where: { id: resourceId },
        include: { user: true },
      });

      if (!ordonnance || !ordonnance.prixTotal) {
        return NextResponse.json(
          { error: "Ordonnance invalide" },
          { status: 400 },
        );
      }

      montant = Number(ordonnance.prixTotal);
      user = ordonnance.user;
    }

    if (type === "BON_COMMANDE") {
      const bon = await prisma.bondecommande.findUnique({
        where: { id: resourceId },
        include: { user: true },
      });

      if (!bon || !bon.prixTotal) {
        return NextResponse.json({ error: "Bon invalide" }, { status: 400 });
      }

      montant = Number(bon.prixTotal);
      user = bon.user;
    }

    if (!montant || !user) {
      return NextResponse.json(
        { error: "Ressource invalide" },
        { status: 400 },
      );
    }

    // 🔥 2. gérer provider
    if (provider !== "PAYDUNYA") {
      return NextResponse.json(
        { error: "Provider non supporté" },
        { status: 400 },
      );
    }

    // 🔐 3. créer paiement
    const transactionId = crypto.randomUUID();

    const paiement = await prisma.paiement.create({
      data: {
        transactionId,
        montant,
        montantInitial: montant,

        devise: "XOF",
        methode,
        provider,

        userId: user.id,
        type,
        resourceId,

        customerName: user.name ?? "",
        customerEmail: user.email ?? "",
        customerPhone: user.phone ?? "",

        successUrl: `${process.env.APP_URL}/paydunya/paiement/success`,
        failureUrl: `${process.env.APP_URL}/paydunya/paiement/failure`,
        notifyUrl: `${process.env.APP_URL}/api/clientbackend/paiement/paydunya/ipn`,

        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    // 💳 4. créer facture PayDunya
    const result = await createPaydunyaInvoice({
      transactionId, // 🔥 IMPORTANT
      amount: montant,
      description: `Paiement ${type}`,
      customer: {
        name: paiement.customerName || "",
        email: paiement.customerEmail || "",
        phone: paiement.customerPhone || "",
      },
      items: [
        {
          name: `Paiement ${type}`,
          quantity: 1,
          unit_price: montant,
        },
      ],
      callbackUrl: paiement.notifyUrl!,
      returnUrl: paiement.successUrl!,
      cancelUrl: paiement.failureUrl!,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    // 🔥 5. update paiement
    await prisma.paiement.update({
      where: { id: paiement.id },
      data: {
        paymentUrl: result.paymentUrl,
        referenceExterne: result.token, // 🔥 TRÈS IMPORTANT
        statut: "EN_COURS",
      },
    });

    return NextResponse.json({
      paymentUrl: result.paymentUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur paiement" }, { status: 500 });
  }
}
