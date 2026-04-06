// ✅ /api/pharmaciebackend/pharmacie/[pharmacieId]/bondecommandes/devis_recu/list/route.ts
//Il affiche tous les bondecommandes dont la pharmacie à déja envoyé un devis donc ils ont statut "DEVIS_RECU" dans cette pharmacie
import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ pharmacieId: string }> },
) {
  try {
    const { pharmacieId } = await context.params;

    // 1️⃣ Vérifier le token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Vérifier le JWT
    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch (err) {
      console.error("Erreur vérification token:", err);
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 },
      );
    }

    // 3️⃣ Vérifier l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    if (user.role !== "PHARMACIE") {
      return NextResponse.json(
        { error: "Accès réservé aux pharmacies" },
        { status: 403 },
      );
    }

    // 4️⃣ Vérifier que la pharmacie existe
    const pharmacie = await prisma.pharmacie.findUnique({
      where: { id: pharmacieId },
    });

    if (!pharmacie) {
      return NextResponse.json(
        { error: "Pharmacie introuvable" },
        { status: 404 },
      );
    }

    // 5️⃣ Récupérer les bondecommandes envoyées
    const bondecommandes = await prisma.bondecommande.findMany({
      where: {
        pharmacieId: pharmacieId,
        statut: "DEVIS_RECU",
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: bondecommandes.length,
        bondecommandes,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ Erreur récupération bondecommandes:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
