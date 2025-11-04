//Supprimer un produit du panier
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface JwtPayload {
  email: string;
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    // ⬇️ Attendre la résolution des paramètres dynamiques
    const { itemId } = await context.params;

    // 1️⃣ Vérifier le token JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token manquant" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (err) {
      console.error("❌ Erreur JWT:", err);
      return NextResponse.json(
        { success: false, message: "Token invalide" },
        { status: 401 }
      );
    }

    // 2️⃣ Vérifier que l’utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 3️⃣ Vérifier que l’article existe et appartient à ce user
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Produit introuvable dans le panier" },
        { status: 404 }
      );
    }

    if (item.cart.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Non autorisé à supprimer cet article" },
        { status: 403 }
      );
    }

    // 4️⃣ Supprimer définitivement le produit du panier
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json(
      { success: true, message: "Produit supprimé du panier avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur DELETE /clientbackend/cart/[itemId]:", error);
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
