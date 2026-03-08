// ✅ Route pour supprimer (soft delete) un bondecommande — réservée au CLIENT

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

interface JwtPayload {
  email: string;
  role: string;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ bondecommandeId: string }> }
) {
  try {
    const { bondecommandeId } = await context.params;

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

    // 2️⃣ Vérifier que l’utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: { bondecommandes: true },
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

    // 3️⃣ Vérifier que le bondecommande existe
    const bondecommande = await prisma.bondecommande.findUnique({
      where: { id: bondecommandeId },
    });

    if (!bondecommande) {
      return NextResponse.json(
        { error: "Bondecommande introuvable" },
        { status: 404 }
      );
    }

    // 4️⃣ Vérifier que le bondecommande appartient bien à ce client
    if (bondecommande.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé à supprimer cette bondecommande" },
        { status: 403 }
      );
    }

    // 5️⃣ Vérifier si elle est déjà supprimée
    if (bondecommande.deletedAt) {
      return NextResponse.json(
        { error: "Bondecommande déjà supprimée" },
        { status: 400 }
      );
    }

    // 6️⃣ Soft delete de l’bondecommande
    await prisma.bondecommande.update({
      where: { id: bondecommandeId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(
      { message: "✅ Bondecommande supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Erreur suppression bondecommande:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
