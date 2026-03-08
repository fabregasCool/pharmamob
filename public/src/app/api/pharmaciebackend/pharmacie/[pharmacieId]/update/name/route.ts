// src/app/api/pharmacie/[pharmacieId]/update/name/route.ts
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
  context: { params: Promise<{ pharmacieId: string }> }
) {
  try {
    const { pharmacieId } = await context.params;

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

    // 2️⃣ Vérifier l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
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

    // 3️⃣ Vérifier la pharmacie
    const pharmacie = await prisma.pharmacie.findUnique({
      where: { id: pharmacieId },
    });

    if (!pharmacie) {
      return NextResponse.json(
        { error: "Pharmacie introuvable" },
        { status: 404 }
      );
    }

    if (pharmacie.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé pour cette pharmacie" },
        { status: 403 }
      );
    }

    // 4️⃣ Récupérer le nouveau nom depuis le body
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nom de pharmacie invalide" },
        { status: 400 }
      );
    }

    // 5️⃣ Mise à jour de la pharmacie
    const updatedPharmacie = await prisma.pharmacie.update({
      where: { id: pharmacieId },
      data: {
        name,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Nom de la pharmacie mis à jour avec succès ✅",
      pharmacie: updatedPharmacie,
    });
  } catch (err) {
    console.error("❌ Erreur API PATCH pharmacie:", err);
    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 }
    );
  }
}
