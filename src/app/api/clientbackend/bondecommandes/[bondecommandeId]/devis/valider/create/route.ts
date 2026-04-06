//api/clientbackend/bondecommandes/[bondecommandeId]/devis/valider/create/route.ts
//Permet au CLIENT de valider le devis reçu

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  context: { params: Promise<{ bondecommandeId: string }> },
) {
  try {
    const { bondecommandeId } = await context.params;

    // 1️⃣ Vérifier le token dans le header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // 2️⃣ Vérifier et décoder le JWT
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

    // 3️⃣ Retrouver l’utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    // ✅ Seul le CLIENT peut faire cette action
    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { error: "Action réservée aux clients" },
        { status: 403 },
      );
    }

    // 4️⃣ Vérifier l’bondecommande
    const bondecommande = await prisma.bondecommande.findUnique({
      where: { id: bondecommandeId },
    });

    if (!bondecommande) {
      return NextResponse.json(
        { error: "Bondecommande introuvable" },
        { status: 404 },
      );
    }

    // 5️⃣ Vérifier que le bondecommande appartient au client
    if (bondecommande.userId !== user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas modifier cette bondecommande" },
        { status: 403 },
      );
    }

    // 6️⃣ Vérifier que le devis existe
    if (bondecommande.statut !== "DEVIS_RECU") {
      return NextResponse.json(
        { error: "Aucun devis à valider" },
        { status: 400 },
      );
    }

    // 7️⃣ Mettre à jour le statut
    const updatedBondecommande = await prisma.bondecommande.update({
      where: { id: bondecommandeId },
      data: {
        statut: "DEVIS_VALIDEE_PAR_CLIENT",
      },
    });

    // 8️⃣ Réponse
    return NextResponse.json(
      {
        success: true,
        message: "Devis validé avec succès",
        bondecommande: updatedBondecommande,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ Erreur validation devis:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
