import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    // 🔐 Vérification du token JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token manquant ou invalide" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Vérifier et décoder le JWT
    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch (err) {
      console.error("Erreur de vérification du token:", err);

      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // 🧾 Lecture du body
    const body = await req.json();
    const { itemId, quantity } = body;

    if (!itemId || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Paramètres invalides" },
        { status: 400 }
      );
    }

    // 🧍 Trouver l’utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 🛒 Vérifier que l’item appartient bien à ce user
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, produit: true },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Article non trouvé dans le panier" },
        { status: 404 }
      );
    }

    if (item.cart.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Non autorisé à modifier cet article" },
        { status: 403 }
      );
    }

    // ✏️ Mettre à jour la quantité
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        produit: {
          include: {
            pharmacie: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Quantité mise à jour avec succès",
        item: updatedItem,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Erreur PATCH /clientbackend/cart/updateQuantity:", err);
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
