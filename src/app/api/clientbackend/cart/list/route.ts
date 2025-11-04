import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // 🔐 Vérification du token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: { email: string; role?: string };

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string; role?: string };
    } catch {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // 👤 Recherche de l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // 🛒 Récupération du panier avec les produits et leur pharmacie
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            produit: {
              include: {
                pharmacie: { select: { id: true, name: true, ville: true } }, // 💊 Affiche infos pharmacie
                category: { select: { id: true, name: true } }, // 🏷️ Optionnel : catégorie du produit
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // ✅ Retour du panier vide si aucun trouvé
    return NextResponse.json(
      {
        success: true,
        cart: cart ?? { id: null, items: [] },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Erreur GET /api/cart:", err);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
