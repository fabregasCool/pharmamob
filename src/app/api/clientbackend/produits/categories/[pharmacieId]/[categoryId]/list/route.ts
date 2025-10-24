//api/clientbackend/produits/categories/[pharmacieId]/[categoryId]/list
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ pharmacieId: string; categoryId: string }> }
) {
  try {
    // 1️⃣ Récupérer les paramètres dynamiques
    const { pharmacieId, categoryId } = await context.params;

    // 2️⃣ Vérifier la présence du header Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 3️⃣ Vérifier et décoder le JWT
    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch (err) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // 4️⃣ Vérifier que l’utilisateur existe et est un client
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Accès réservé aux clients" },
        { status: 403 }
      );
    }

    // 5️⃣ Vérifier que la pharmacie existe
    const pharmacie = await prisma.pharmacie.findUnique({
      where: { id: pharmacieId },
    });

    if (!pharmacie) {
      return NextResponse.json(
        { error: "Pharmacie introuvable" },
        { status: 404 }
      );
    }

    // 6️⃣ Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie introuvable" },
        { status: 404 }
      );
    }

    // 7️⃣ Récupérer les produits de cette catégorie dans cette pharmacie
    const produits = await prisma.produit.findMany({
      where: {
        pharmacieId: pharmacieId,
        categoryId: categoryId,
        deletedAt: null,
      },
      include: {
        pharmacie: true,
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      pharmacie: {
        id: pharmacie.id,
        name: pharmacie.name,
        logo: pharmacie.logo,
      },
      category: {
        id: category.id,
        name: category.name,
      },
      produits,
    });
  } catch (err) {
    console.error(
      "❌ Erreur GET /api/clientbackend/produits/categories/[pharmacieId]/[categoryId]/list:",
      err
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
