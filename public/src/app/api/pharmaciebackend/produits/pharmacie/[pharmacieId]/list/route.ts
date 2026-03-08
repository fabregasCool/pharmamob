//src/app/api/produits/pharmacie/[pharmacieId]/list/route.ts
// Retourner les produits de cette pharmacie sauf ceux qui ont été supprimés (archivés)
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface JwtPayload {
  email: string;
  role: string;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ pharmacieId: string }> } // 👈 params est une Promise
) {
  try {
    const { pharmacieId } = await context.params; // 👈 on attend params

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

    // 2️⃣ Vérifier l'utilisateur et ses pharmacies
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

    // 3️⃣ Vérifier que la pharmacie appartient bien à l'utilisateur
    const pharmacie = await prisma.pharmacie.findUnique({
      where: { id: pharmacieId },
      include: {
        produits: {
          where: { deletedAt: null }, // ⬅️ seulement les produits non supprimés
          orderBy: {
            createdAt: "desc", // ⬅️ tri décroissant (du plus récent au plus ancien)
          },
          include: { category: true }, // ✅ ici c’est le bon emplacement                                                       
        },
      },
    });

    if (!pharmacie) {
      return NextResponse.json(
        { error: "pharmacie introuvable" },
        { status: 404 }
      );
    }

    if (pharmacie.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé pour cette pharmacie" },
        { status: 403 }
      );
    }

    // 4️⃣ Retourner les produits de cette pharmacie
    return NextResponse.json({
      produits: pharmacie.produits,
    });
  } catch (error) {
    console.error("🔥 Erreur API Produits:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
