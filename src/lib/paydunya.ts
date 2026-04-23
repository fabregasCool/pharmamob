import paydunya from "paydunya";

// 🔥 Setup global (exécuté une seule fois)
new paydunya.Setup({
  masterKey: process.env.PAYDUNYA_MASTER_KEY!,
  privateKey: process.env.PAYDUNYA_PRIVATE_KEY!,
  publicKey: process.env.PAYDUNYA_PUBLIC_KEY!,
  token: process.env.PAYDUNYA_TOKEN!,
  mode: process.env.PAYDUNYA_MODE || "test",
});

// 🔥 Configuration business (optionnelle mais propre)
new paydunya.Store({
  name: "Ma Pharmacie",
  tagline: "Vos médicaments en toute sécurité",
  phoneNumber: "+2250700000000", // ✅ format international
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

    // 🔹 Sécurisation téléphone
    const safePhone = customer.phone || "+2250700000000";

    // 🔹 Ajouter les items (source principale du total)
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

    // ❌ SUPPRIMÉ : invoice.totalAmount = amount;
    // 👉 PayDunya calcule automatiquement via les items

    // 🔹 Infos client
    invoice.addCustomer(customer.name, customer.email || "", safePhone);

    // 🔹 URLs
    invoice.callbackURL = callbackUrl;
    invoice.returnURL = returnUrl;
    invoice.cancelURL = cancelUrl;

    // 🔥 Création de la facture
    const created = await invoice.create();

    if (!created) {
      throw new Error(invoice.responseText);
    }

    // 🔐 Vérification de sécurité
    if (!invoice.token || !invoice.invoice_url) {
      throw new Error("Réponse PayDunya invalide");
    }

    return {
      success: true,
      token: invoice.token, // 🔥 référence externe
      paymentUrl: invoice.invoice_url, // 🔥 lien paiement
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
