import paydunya from "paydunya";

// 🔥 Setup global (lit automatiquement tes variables .env)
export const setup = new paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY!,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY!,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY!,
  token: process.env.PAYDUNYA_TOKEN!,
  mode: process.env.PAYDUNYA_MODE || "test",
});

// 🔥 Configuration de ton business (affiché côté PayDunya)
export const store = new paydunya.Store({
  name: "Ma Pharmacie",
  tagline: "Vos médicaments en toute sécurité",
  phoneNumber: "0700000000",
  postalAddress: "Abidjan, Côte d'Ivoire",
  websiteURL: "https://tonsite.com",
});

// 🔥 Fonction principale pour créer un paiement
export async function createPaydunyaInvoice({
  amount,
  description,
  customer,
  items = [],
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
    const invoice = new paydunya.CheckoutInvoice();

    // 🔹 Ajouter les items (important pour détail facture)
    items.forEach((item) => {
      invoice.addItem(
        item.name,
        item.quantity,
        item.unit_price,
        item.unit_price * item.quantity,
        item.description || "",
      );
    });

    // 🔹 Description globale
    invoice.description = description;

    // 🔹 Total (sécurité)
    invoice.totalAmount = amount;

    // 🔹 Infos client
    invoice.addCustomer(customer.name, customer.email || "", customer.phone);

    // 🔹 URLs
    invoice.callbackURL = callbackUrl; // IPN
    invoice.returnURL = returnUrl; // succès
    invoice.cancelURL = cancelUrl; // annulation

    // 🔥 Création de la facture
    const created = await invoice.create();

    if (!created) {
      throw new Error(invoice.responseText);
    }

    return {
      success: true,
      token: invoice.token, // 🔥 IMPORTANT (referenceExterne)
      paymentUrl: invoice.invoice_url, // 🔥 lien à envoyer au client
    };
  } catch (error: unknown) {
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
