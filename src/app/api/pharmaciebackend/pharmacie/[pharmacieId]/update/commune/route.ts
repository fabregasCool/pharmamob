// src/app/api/pharmaciebackend/pharmacie/[pharmacieId]/update/commune
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface JwtPayload {
  email: string;
  role: string;
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ pharmacieId: string }> },
) {
  try {
    // 1️⃣ Attendre les paramètres (Next.js 15+)
    const { pharmacieId } = await context.params;

    // 2️⃣ Vérifier le token JWT
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

    // 3️⃣ Vérifier que l’utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { pharmacies: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    // 4️⃣ Vérifier le rôle
    if (user.role !== "PHARMACIE") {
      return NextResponse.json(
        { error: "Accès réservé aux pharmacies" },
        { status: 403 },
      );
    }

    // 5️⃣ Vérifier que la pharmacie existe
    const pharmacie = await prisma.pharmacie.findUnique({
      where: { id: pharmacieId },
    });

    if (!pharmacie) {
      return NextResponse.json(
        { error: "Pharmacie introuvable" },
        { status: 404 },
      );
    }

    // 6️⃣ Vérifier que le pharmacie appartient à la pharmacie du user
    const isOwner = user.pharmacies.some((p) => p.id === pharmacieId);
    if (!isOwner) {
      return NextResponse.json(
        { error: "Non autorisé à modifier ce pharmacie" },
        { status: 403 },
      );
    }

    // 7️⃣ Lire et valider le body
    const body = await req.json();
    const { communeId } = body;

    // 8️⃣ Vérifier la commune si elle est précisée
    if (communeId) {
      const commune = await prisma.commune.findUnique({
        where: { id: communeId },
      });
      if (!commune) {
        return NextResponse.json(
          { error: "commune introuvable" },
          { status: 404 },
        );
      }
    }

    // 9️⃣ Mise à jour du pharmacie
    const updatedPharmacie = await prisma.pharmacie.update({
      where: { id: pharmacieId },
      data: {
        communeId: communeId ?? pharmacie.communeId,
      },
      include: {
        commune: true,
      },
    });

    // 🔟 Réponse OK
    return NextResponse.json(
      {
        message: "✅ Commmune mise à jour avec succès",
        pharmacie: updatedPharmacie,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Erreur mise à jour pharmacie:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
