// src/app/api/produits/[produitId]/delete/route.ts
// ✅ Route pour supprimer un produit (soft delete) avec vérification JWT et appartenance

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface JwtPayload {
  email: string;
  role: string;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ produitId: string }> }
) {
  try {
    // ⬇️ On attend la résolution de params
    const { produitId } = await context.params;

    // 1️⃣ Vérifier le token JWT
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

    const userEmail = decoded.email;

    // 2️⃣ Vérifier que l’utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
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

    // 3️⃣ Vérifier que le produit existe (et n’est pas déjà supprimé)
    const produit = await prisma.produit.findUnique({
      where: { id: produitId },
      include: { pharmacie: true },
    });

    if (!produit) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    if (produit.deletedAt) {
      return NextResponse.json(
        { error: "Produit déjà supprimé" },
        { status: 400 }
      );
    }

    // 4️⃣ Vérifier que le produit appartient à une des pharmacies de l’utilisateur
    const isOwner = user.pharmacies.some((b) => b.id === produit.pharmacieId);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Non autorisé à supprimer ce produit" },
        { status: 403 }
      );
    }

    // 5️⃣ Soft delete du produit
    await prisma.produit.update({
      where: { id: produitId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: "✅ Produit supprimé (soft delete) avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur suppression produit:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
