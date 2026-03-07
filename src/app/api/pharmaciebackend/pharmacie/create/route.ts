// src/app/api/pharmacie/create/route.ts
// Créer une pharmacie

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { seedProductsForPharmacie } from "../../../../../../prisma/seedProductsForPharmacie";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {

    // 1️⃣ Vérifier Authorization
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Vérifier JWT
    let decoded: { email: string };

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // 3️⃣ Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 4️⃣ Body
    const body = await req.json();

    const {
      name,
      communeId,
      quartier,
      phone,
      logo,
      slogan
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de la pharmacie est obligatoire" },
        { status: 400 }
      );
    }

    if (!communeId) {
      return NextResponse.json(
        { error: "communeId est obligatoire" },
        { status: 400 }
      );
    }

    // 5️⃣ Vérifier que la commune existe
    const commune = await prisma.commune.findUnique({
      where: { id: communeId }
    });

    if (!commune) {
      return NextResponse.json(
        { error: "Commune introuvable" },
        { status: 404 }
      );
    }

    // 6️⃣ Créer la pharmacie
    const pharmacie = await prisma.pharmacie.create({
      data: {
        name,
        communeId,
        quartier,
        phone,
        logo,
        slogan,
        userId: user.id,
      },
      include: {
        commune: true,
        produits: true,
        commandes: true,
      },
    });

    // 7️⃣ Seeder les produits
    await seedProductsForPharmacie(pharmacie.id);

    // 8️⃣ Réponse
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

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}