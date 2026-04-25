// src/lib/paydunya.ts

type PaydunyaApiResponse = {
  response_code: string;
  response_text: string;
  token?: string;
  message?: string;
};

export async function createPaydunyaInvoice({
  transactionId,
  amount,
  description,
  customer,
  items = [],
  callbackUrl,
  returnUrl,
  cancelUrl,
}: {
  transactionId?: string;
  amount: number;
  description: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
  items?: {
    name: string;
    quantity: number;
    unit_price: number;
    description?: string;
  }[];
  callbackUrl: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  try {
    if (
      !process.env.PAYDUNYA_MASTER_KEY ||
      !process.env.PAYDUNYA_PRIVATE_KEY ||
      !process.env.PAYDUNYA_PUBLIC_KEY ||
      !process.env.PAYDUNYA_TOKEN
    ) {
      throw new Error("Configuration PayDunya manquante");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    // 🔍 DEBUG DES VARIABLES D'ENV
    console.log("==== PAYDUNYA CONFIG ====");
    console.log("MASTER_KEY:", process.env.PAYDUNYA_MASTER_KEY);
    console.log("PRIVATE_KEY:", process.env.PAYDUNYA_PRIVATE_KEY);
    console.log("PUBLIC_KEY:", process.env.PAYDUNYA_PUBLIC_KEY);
    console.log("TOKEN:", process.env.PAYDUNYA_TOKEN);
    console.log("=========================");

    const response = await fetch(
      "https://app.paydunya.com/api/v1/checkout-invoice/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY,
          "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY,
          "PAYDUNYA-PUBLIC-KEY": process.env.PAYDUNYA_PUBLIC_KEY,
          "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN,
        },
        body: JSON.stringify({
          invoice: {
            total_amount: amount,
            description,
          },
          store: {
            name: "Ma Pharmacie",
          },
          actions: {
            callback_url: callbackUrl,
            return_url: returnUrl,
            cancel_url: cancelUrl,
          },
          items:
            items.length > 0
              ? items.map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  total_price: item.unit_price * item.quantity,
                  description: item.description || "",
                }))
              : [
                  {
                    name: description,
                    quantity: 1,
                    unit_price: amount,
                    total_price: amount,
                    description,
                  },
                ],
          custom_data: {
            transaction_id: transactionId,
            customer_name: customer.name,
            customer_email: customer.email || "",
            customer_phone: customer.phone,
          },
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeout);

    let data: PaydunyaApiResponse;
    try {
      data = await response.json();
    } catch {
      throw new Error("Réponse PayDunya invalide (non JSON)");
    }

    console.log("PAYDUNYA RESPONSE:", data);

    if (!response.ok) {
      throw new Error(data?.message || "Erreur PayDunya");
    }

    if (data?.response_code !== "00") {
      throw new Error(data?.response_text || "Erreur PayDunya");
    }

    if (!data?.response_text) {
      throw new Error("URL de paiement introuvable");
    }

    if (!data?.token) {
      throw new Error("Token PayDunya manquant");
    }

    return {
      success: true,
      token: data.token,
      paymentUrl: data.response_text,
    };
  } catch (error: unknown) {
    console.error("PAYDUNYA ERROR:", error);

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: "Erreur inconnue",
    };
  }
}
