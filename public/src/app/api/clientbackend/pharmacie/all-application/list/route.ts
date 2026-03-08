// src/app/api/clientbackend/pharmacie/all-pharmacie/list/route.ts
// ✅ Affiche toutes les pharmacies de l'application (accessible uniquement aux CLIENTS)

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // 1️⃣ Vérifier le header Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Décoder le JWT
    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch (err) {
      console.error("Erreur de vérification du token:", err);
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 },
      );
    }

    // 3️⃣ Vérifier que l'utilisateur existe et a le rôle CLIENT
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Accès réservé aux clients" },
        { status: 403 },
      );
    }

    // 4️⃣ Récupérer toutes les pharmacies de l'application
    const pharmacies = await prisma.pharmacie.findMany({
      include: {
        produits: true, // si tu veux afficher les produits liés
        commandes: true, // si tu veux afficher les commandes liées
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    // 5️⃣ Retourner la réponse
    return NextResponse.json({
      success: true,
      pharmacies,
    });
  } catch (err) {
    console.error("❌ Erreur GET /api/pharmacie/list:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
