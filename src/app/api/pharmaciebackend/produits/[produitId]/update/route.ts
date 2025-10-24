import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

declare global {
  /// eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma ?? new PrismaClient();
if (!globalThis.__prisma) {
  globalThis.__prisma = prisma;
}

interface JwtPayload {
  email: string;
  role: string;
}

export async function PUT(
  req: NextRequest,
  context?: { params?: { produitId?: string } }
) {
  try {
    const produitId = context?.params?.produitId;
    if (!produitId) {
      return NextResponse.json(
        { error: "ID du produit manquant" },
        { status: 400 }
      );
    }

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

    if (user.role !== "PHARMACIE") {
      return NextResponse.json(
        { error: "Accès réservé aux pharmacies" },
        { status: 403 }
      );
    }

    const produit = await prisma.produit.findUnique({
      where: { id: produitId },
    });

    if (!produit) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    const isOwner = user.pharmacies.some((p) => p.id === produit.pharmacieId);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Non autorisé à modifier ce produit" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, prix, imageUrl, categoryId } = body;

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

    return NextResponse.json(
      { message: "✅ Produit mis à jour avec succès", produit: updatedProduit },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur mise à jour produit:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
