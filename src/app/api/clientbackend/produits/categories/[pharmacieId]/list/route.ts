//api/clientbackend/produits/categories/[pharmacieId]/list
//Permet de recupérer les category de produits par pharmacie
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ pharmacieId: string }> }
) {
  try {
    // 1️⃣ Attendre les params
    const { pharmacieId } = await context.params;

    // 2️⃣ Vérifier le header Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 3️⃣ Décoder le JWT
    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch (err) {
      console.error("Erreur de vérification du token:", err);
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // 4️⃣ Vérifier l’utilisateur
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

    // 5️⃣ Récupérer les catégories spécifiques à cette pharmacie
    const categories = await prisma.category.findMany({
      where: {
        produits: {
          some: {
            pharmacieId: pharmacieId,
            deletedAt: null,
          },
        },
      },
      include: {
        produits: {
          where: {
            pharmacieId: pharmacieId,
            deletedAt: null,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, categories });
  } catch (err) {
    console.error(
      "❌ Erreur GET /api/clientbackend/produits/categories/[pharmacieId]/list:",
      err
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
