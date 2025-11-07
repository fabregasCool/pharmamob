// ✅ /api/adminbackend/bondecommandes/recu_devis/list/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // 1️⃣ Vérifier le token dans le header
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
      console.error("Erreur de vérification du token:", err);
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // 3️⃣ Vérifier que l’utilisateur est admin
    const admin = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: { id: true, role: true },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé : réservé aux administrateurs" },
        { status: 403 }
      );
    }

    // 4️⃣ Récupérer toutes les bondecommandes avec statut DEVIS_RECU
    const bondecommandes = await prisma.bondecommande.findMany({
      where: {
        statut: "DEVIS_RECU",
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        pharmacie: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 5️⃣ Répondre avec la liste complète
    return NextResponse.json(
      {
        success: true,
        count: bondecommandes.length,
        bondecommandes,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(
      "❌ Erreur GET /api/adminbackend/bondecommandes/devis_recu/list:",
      err
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
