//src/app/api/pharmaciebackend/produits/pharmacie/[pharmacieId]/create/route.ts
//Créer un produit dans une pharmacie
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1️⃣ Vérifier le header Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Vérifier et décoder le JWT
    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch (err) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // 3️⃣ Retrouver l’utilisateur
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 4️⃣ Lire le corps de la requête
    const body = await req.json();
    const {
      title,
      description,
      imageUrl,
      prix,
      pharmacieId,
      categoryId, // ✅ on reçoit maintenant l'id de la catégorie
    } = body;

    if (!title || !prix || !pharmacieId || !categoryId) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    // 5️⃣ Vérifier si la pharmacie existe
    const pharmacie = await prisma.pharmacie.findUnique({
      where: { id: pharmacieId },
    });

    if (!pharmacie) {
      return NextResponse.json(
        { error: "Pharmacie introuvable" },
        { status: 404 }
      );
    }

    // 6️⃣ Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie introuvable" },
        { status: 404 }
      );
    }

    // 7️⃣ Créer le produit
    const produit = await prisma.produit.create({
      data: {
        title,
        description,
        imageUrl,
        prix,
        pharmacieId,
        categoryId, // ✅ liaison à la catégorie
      },
      include: {
        category: true,
        pharmacie: true,
      },
    });

    // 8️⃣ Retourner la réponse
    return NextResponse.json({
      success: true,
      produit,
    });
  } catch (err) {
    console.error("❌ Erreur POST /api/pharmaciebackend/produits/create:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
