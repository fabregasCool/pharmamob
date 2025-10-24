//app/api/pharmaciebackend/produits/categories/list
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

    // 3️⃣ Vérifier si l’utilisateur existe (optionnel)
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 4️⃣ Récupérer toutes les catégories
    const categories = await prisma.category.findMany({
      include: {
        produits: true, // ✅ si tu veux inclure les produits liés
      },
      orderBy: { createdAt: "desc" },
    });

    // 5️⃣ Retourner la réponse
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (err) {
    console.error("❌ Erreur GET /api/pharmaciebackend/categories:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
