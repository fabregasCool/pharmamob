import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();

// ✅ Validation du corps de la requête
const addSchema = z.object({
  produitId: z.string().min(1, "L’ID du produit est requis"),
  quantity: z.number().int().min(1, "La quantité doit être au minimum 1"),
});

export async function POST(req: Request) {
  try {
    // ✅ Vérification du token JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: { email: string; role?: string };

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        email: string;
        role?: string;
      };
    } catch {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // ✅ Autorisation
    if (decoded.role && decoded.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Accès réservé aux clients" },
        { status: 403 }
      );
    }

    // ✅ Lecture du corps de la requête
    const body = await req.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { produitId, quantity } = parsed.data;

    // ✅ Trouver l’utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });
    if (!user)
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );

    // ✅ Vérifier que le produit existe et appartient bien à une pharmacie
    const produit = await prisma.produit.findFirst({
      where: {
        id: produitId,
        deletedAt: null, // on ignore les produits supprimés
      },
      include: {
        pharmacie: true,
      },
    });
    if (!produit)
      return NextResponse.json(
        { error: "Produit introuvable ou supprimé" },
        { status: 404 }
      );

    if (!produit.pharmacie) {
      return NextResponse.json(
        { error: "Ce produit n’est rattaché à aucune pharmacie" },
        { status: 400 }
      );
    }

    // ✅ Récupérer ou créer le panier
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    // ✅ Vérifier si le produit existe déjà dans le panier
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        produitId,
      },
    });

    if (existingItem) {
      // 🔄 Incrémente la quantité
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // 🆕 Ajout du produit au panier
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          produitId,
          quantity,
          priceSnapshot: produit.prix,
        },
      });
    }

    // ✅ Retour du panier complet avec produits et pharmacies
    const fullCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            produit: {
              include: {
                pharmacie: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(
      { success: true, cart: fullCart },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Erreur /api/cart/add:", err);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
