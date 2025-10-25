import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface JwtPayload {
  email: string;
  role: string;
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ produitId: string }> }
) {
  try {
    // 1️⃣ Attendre les paramètres (Next.js 15+)
    const { produitId } = await context.params;

    // 2️⃣ Vérifier le token JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (err) {
      console.error("❌ Erreur JWT:", err);
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // 3️⃣ Vérifier que l’utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { pharmacies: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 4️⃣ Vérifier le rôle
    if (user.role !== "PHARMACIE") {
      return NextResponse.json(
        { error: "Accès réservé aux pharmacies" },
        { status: 403 }
      );
    }

    // 5️⃣ Vérifier que le produit existe
    const produit = await prisma.produit.findUnique({
      where: { id: produitId },
    });

    if (!produit) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    // 6️⃣ Vérifier que le produit appartient à la pharmacie du user
    const isOwner = user.pharmacies.some((p) => p.id === produit.pharmacieId);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Non autorisé à modifier ce produit" },
        { status: 403 }
      );
    }

    // 7️⃣ Lire et valider le body
    const body = await req.json();
    const { title, description, prix, imageUrl, categoryId } = body;

    // 8️⃣ Vérifier la catégorie si elle est précisée
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        return NextResponse.json(
          { error: "Catégorie introuvable" },
          { status: 404 }
        );
      }
    }

    // 9️⃣ Mise à jour du produit
    const updatedProduit = await prisma.produit.update({
      where: { id: produitId },
      data: {
        title,
        description,
        prix,
        imageUrl,
        categoryId: categoryId ?? produit.categoryId,
      },
      include: {
        category: true,
        pharmacie: true,
      },
    });

    // 🔟 Réponse OK
    return NextResponse.json(
      {
        message: "✅ Produit mis à jour avec succès",
        produit: updatedProduit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur mise à jour produit:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
