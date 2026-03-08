//app/api/pharmaciebackend/pharmacie/communes/list

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

    // 3️⃣ Vérifier si l’utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    // 4️⃣ Récupérer toutes les communes
    const communes = await prisma.commune.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        pharmacies: true,
        livreurs: true,
        clients: true,
      },
    });

    // 5️⃣ Retourner la réponse finale
    return NextResponse.json({
      success: true,
      communes,
    });
  } catch (err) {
    console.error("❌ Erreur GET /api/pharmaciebackend/communes:", err);

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
