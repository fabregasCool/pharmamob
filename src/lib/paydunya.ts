import axios from "axios";

export async function createPaydunyaInvoice({
  amount,
  description,
  customer,
  callbackUrl,
  returnUrl,
  cancelUrl,
}: {
  amount: number;
  description: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
  callbackUrl: string;
  returnUrl: string;
  cancelUrl: string;
}) {
  try {
    const response = await axios.post(
      "https://app.paydunya.com/api/v1/checkout-invoice/create",
      {
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
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      },
      {
        headers: {
          "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY!,
          "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY!,
          "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN!,
        },
      },
    );

    const data = response.data;

    if (!data.response_code || data.response_code !== "00") {
      throw new Error(data.response_text || "Erreur PayDunya");
    }

    return {
      success: true,
      token: data.token,
      paymentUrl: data.response_text, // ⚠️ parfois ici ou invoice_url selon version
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);

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
