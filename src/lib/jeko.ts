import crypto from "crypto";

const JEKO_BASE_URL = "https://api.jeko.africa/partner_api";

function jekoHeaders() {
  return {
    "X-API-KEY": process.env.JEKO_API_KEY!,
    "X-API-KEY-ID": process.env.JEKO_API_KEY_ID!,
    "Content-Type": "application/json",
  };
}

export async function createJekoPaymentRequest({
  amountCents,
  reference,
  paymentMethod, // "wave" | "orange" | "mtn" | "moov" | "djamo" | undefined
}: {
  amountCents: number;
  reference: string;
  paymentMethod?: string;
}) {
  const res = await fetch(`${JEKO_BASE_URL}/payment_requests`, {
    method: "POST",
    headers: jekoHeaders(),
    body: JSON.stringify({
      storeId: process.env.JEKO_STORE_ID,
      amountCents,
      currency: "XOF",
      reference,
      paymentDetails: {
        type: "redirect",
        data: {
          ...(paymentMethod ? { paymentMethod } : {}),
          successUrl: `${process.env.APP_URL}/paiement/jeko/merci?ref=${reference}`,
          errorUrl: `${process.env.APP_URL}/paiement/jeko/echec?ref=${reference}`,
        },
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Jèko error: ${JSON.stringify(data)}`);
  return data; // { id, redirectUrl, status, ... }
}

export async function getJekoPaymentRequest(paymentRequestId: string) {
  const res = await fetch(
    `${JEKO_BASE_URL}/payment_requests/${paymentRequestId}`,
    {
      headers: jekoHeaders(),
    },
  );
  if (!res.ok) throw new Error("Jèko: impossible de récupérer le statut");
  return res.json();
}

export function verifyJekoSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", process.env.JEKO_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  const receivedBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (receivedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(receivedBuf, expectedBuf);
}
