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

  if (!verifyJekoSignature(rawBody, signature)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body: JekoWebhookBody = JSON.parse(rawBody);

  queueMicrotask(() => traiterTransactionJeko(body));

  return Response.json({ received: true }, { status: 200 });
}

async function traiterTransactionJeko(body: JekoWebhookBody) {
  if ("event" in body && body.event === "SERVICE_PROVIDER_LINK_REQUEST") return;

  const transaction = body as JekoTransactionCompleted;
  const paymentRequestId = transaction.transactionDetails?.id;
  if (!paymentRequestId) return;

  const paiement = await prisma.paiementJeko.findUnique({
    where: { jekoPaymentRequestId: paymentRequestId },
  });
  if (!paiement) return;

  if (paiement.statut === "SUCCESS" || paiement.statut === "ERROR") return;

  const nouveauStatut = transaction.status === "success" ? "SUCCESS" : "ERROR";

  await prisma.paiementJeko.update({
    where: { id: paiement.id },
    data: {
      statut: nouveauStatut,
      transactionId: transaction.id,
      counterpartLabel: transaction.counterpartLabel,
      counterpartIdentifier: transaction.counterpartIdentifier,
      fraisJeko: transaction.fees?.amount
        ? transaction.fees.amount / 100
        : undefined,
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
    }
    if (paiement.type === "BON_COMMANDE" && paiement.bondecommandeId) {
      await prisma.bondecommande.update({
        where: { id: paiement.bondecommandeId },
        data: { statut: "PAYEE" },
      });
    }
  }
}
