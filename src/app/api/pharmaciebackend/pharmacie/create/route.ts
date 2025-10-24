// src/app/api/pharmacie/create/route.ts
//Créer une pharmacie
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

    // 4️⃣ Récupérer les données envoyées dans le body
    const body = await req.json();
    const { name, ville, commune, quartier, phone, logo, slogan } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de la pharmacie est obligatoire" },
        { status: 400 }
      );
    }

    // 5️⃣ Créer la pharmacie liée à l’utilisateur
    const pharmacie = await prisma.pharmacie.create({
      data: {
        name,
        ville,
        commune,
        quartier,
        phone,
        logo,
        slogan,
        userId: user.id, // ✅ liaison à l’utilisateur connecté
      },
      include: {
        produits: true, // 🔥 renvoie une liste (même vide)
        commandes: true, // 🔥 renvoie une liste (même vide)
      },
    });

    // 6️⃣ Retourner la pharmacie créée
    return NextResponse.json({
      success: true,
      pharmacie: {
        ...pharmacie,
        produits: pharmacie.produits ?? [],
        commandes: pharmacie.commandes ?? [],
      },
    });
  } catch (err) {
    console.error("❌ Erreur POST /api/pharmacie/create:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
