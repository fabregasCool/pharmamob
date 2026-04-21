declare module "paydunya" {
  export class Setup {
    constructor(config?: {
      masterKey?: string;
      privateKey?: string;
      publicKey?: string;
      token?: string;
      mode?: string;
    });
  }

  export class Store {
    constructor(config: {
      name: string;
      tagline?: string;
      phoneNumber?: string;
      postalAddress?: string;
      websiteURL?: string;
      logoURL?: string;
    });
  }

  export class CheckoutInvoice {
    token: string;
    invoice_url: string;
    responseText: string;

    totalAmount: number;
    description: string;

    callbackURL: string;
    returnURL: string;
    cancelURL: string;

    addItem(
      name: string,
      quantity: number,
      unit_price: number,
      total_price: number,
      description?: string
    ): void;

    addCustomer(
      name: string,
      email: string,
      phone: string
    ): void;

    create(): Promise<boolean>;
  }

  const paydunya: {
    Setup: typeof Setup;
    Store: typeof Store;
    CheckoutInvoice: typeof CheckoutInvoice;
  };

  export default paydunya;
}