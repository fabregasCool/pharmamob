//src/app/api/pharmacie/list/route.ts
//Affiche la liste des pharmacies de l'utilisateur connecté
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
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // 3️⃣ Retrouver l’utilisateur et ses pharmacies
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: {
        pharmacies: {
          include: {
            produits: true, // ✅ si tu veux récupérer les produits
            commandes: true, // ✅ si tu veux récupérer les commandes
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 4️⃣ Retourner uniquement la liste des pharmacies
    return NextResponse.json({
      success: true,
      pharmacies: user.pharmacies,
    });
  } catch (err) {
    console.error("❌ Erreur GET /api/pharmacies:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
