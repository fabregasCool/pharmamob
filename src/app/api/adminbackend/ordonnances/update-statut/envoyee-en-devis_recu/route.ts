//Modifier le statut de la commande ordonnance de ENVOYEE à DEVIS RECU

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function PUT(req: Request) {
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

    // 4️⃣ Récupérer l'ID de l’ordonnance dans le body
    const body = await req.json();
    const { ordonnanceId } = body;

    if (!ordonnanceId) {
      return NextResponse.json(
        { error: "ID de l’ordonnance manquant" },
        { status: 400 }
      );
    }

    // 5️⃣ Vérifier que l’ordonnance existe et est ENVOYEE
    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: ordonnanceId },
      select: { id: true, statut: true },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance introuvable" },
        { status: 404 }
      );
    }

    if (ordonnance.statut !== "ENVOYEE") {
      return NextResponse.json(
        { error: "Cette ordonnance n’est pas au statut ENVOYEE" },
        { status: 400 }
      );
    }

    // 6️⃣ Mettre à jour le statut
    const updated = await prisma.ordonnance.update({
      where: { id: ordonnanceId },
      data: { statut: "DEVIS_RECU" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // 7️⃣ Réponse finale
    return NextResponse.json(
      {
        success: true,
        message: "Statut mis à jour en DEVIS_RECU",
        ordonnance: updated,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(
      "❌ Erreur PUT /api/adminbackend/ordonnances/update-statut/envoyee-en-devis_recu:",
      err
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
