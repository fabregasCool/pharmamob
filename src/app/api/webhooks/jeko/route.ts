// app/api/webhooks/jeko/route.ts
import { PrismaClient } from "@prisma/client";
import { verifyJekoSignature } from "@/lib/jeko";

const prisma = new PrismaClient();

interface JekoTransactionDetails {
  id?: string;
  reference?: string;
  paymentLinkId?: string;
}

interface JekoTransactionCompleted {
  id: string;
  amount: { amount: number; currency: string };
  fees: { amount: number; currency: string };
  status: "pending" | "success" | "error";
  counterpartLabel?: string;
  counterpartIdentifier?: string;
  paymentMethod?: string;
  transactionType: string;
  businessName?: string;
  storeName?: string;
  description?: string;
  executedAt?: string;
  transactionDetails?: JekoTransactionDetails;
}

interface JekoServiceProviderLinkRequest {
  event: "SERVICE_PROVIDER_LINK_REQUEST";
  payload: {
    id: string;
    status: string;
    [key: string]: unknown;
  };
}

type JekoWebhookBody =
  | JekoTransactionCompleted
  | JekoServiceProviderLinkRequest;

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("jeko-signature");

  console.log("📩 Webhook Jèko reçu (rawBody):", rawBody);

  if (!verifyJekoSignature(rawBody, signature)) {
    console.error("❌ Signature invalide");
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body: JekoWebhookBody = JSON.parse(rawBody);
  console.log("📦 Body parsé:", JSON.stringify(body, null, 2));

  // queueMicrotask(() => traiterTransactionJeko(body));
  // 👇 await au lieu de queueMicrotask : garantit que le traitement se termine avant la réponse
  await traiterTransactionJeko(body);

  return Response.json({ received: true }, { status: 200 });
}

async function traiterTransactionJeko(body: JekoWebhookBody) {
  if ("event" in body && body.event === "SERVICE_PROVIDER_LINK_REQUEST") {
    console.log("↩️ Event SERVICE_PROVIDER_LINK_REQUEST ignoré");
    return;
  }

  const transaction = body as JekoTransactionCompleted;
  const reference = transaction.transactionDetails?.reference;

  console.log("🔎 reference extraite:", reference);

  if (!reference) {
    console.error(
      "❌ Aucune reference trouvée dans transactionDetails.reference — structure inattendue",
    );
    return;
  }

  const paiement = await prisma.paiementJeko.findUnique({
    where: { reference },
  });

  console.log("🔎 Paiement trouvé en base:", paiement ? paiement.id : "AUCUN");

  if (!paiement) return;

  if (paiement.statut === "SUCCESS" || paiement.statut === "ERROR") {
    console.log("↩️ Paiement déjà traité, statut actuel:", paiement.statut);
    return;
  }

  const nouveauStatut = transaction.status === "success" ? "SUCCESS" : "ERROR";

  console.log("✏️ Mise à jour du paiement:", paiement.id, "→", nouveauStatut);

  await prisma.paiementJeko.update({
    where: { id: paiement.id },
    data: {
      statut: nouveauStatut,
      jekoPaymentRequestId:
        paiement.jekoPaymentRequestId ?? transaction.transactionDetails?.id,
      transactionId: transaction.id,
      counterpartLabel: transaction.counterpartLabel,
      counterpartIdentifier: transaction.counterpartIdentifier,
      fraisJeko: transaction.fees?.amount / 100, // 👇 diviser par 100 : fees.amount est dans la même unité que amountCents envoyé
      callbackAt: new Date(),
      rawWebhookData: transaction as unknown as object,
    },
  });

  if (nouveauStatut === "SUCCESS") {
    if (paiement.type === "ORDONNANCE" && paiement.ordonnanceId) {
      await prisma.ordonnance.update({
        where: { id: paiement.ordonnanceId },
        data: { statut: "PAYEE" },
      });
      console.log("✅ Ordonnance marquée PAYEE:", paiement.ordonnanceId);
    }
    if (paiement.type === "BON_COMMANDE" && paiement.bondecommandeId) {
      await prisma.bondecommande.update({
        where: { id: paiement.bondecommandeId },
        data: { statut: "PAYEE" },
      });
      console.log("✅ Bon de commande marqué PAYEE:", paiement.bondecommandeId);
    }
  }
}
