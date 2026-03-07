// src/app/api/pharmacie/[pharmacieId]/update/commune/route.ts

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

    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 });
    }

    // 2️⃣ Vérifier utilisateur
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
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

    // 3️⃣ Vérifier pharmacie
    const pharmacie = await prisma.pharmacie.findUnique({
      where: { id: pharmacieId },
    });

    if (!pharmacie) {
      return NextResponse.json(
        { error: "Pharmacie introuvable" },
        { status: 404 },
      );
    }

    if (pharmacie.userId !== user.id) {
      return NextResponse.json(
        { error: "Non autorisé pour cette pharmacie" },
        { status: 403 },
      );
    }

    // 4️⃣ Body
    const body = await req.json();
    const { communeId } = body;

    if (!communeId) {
      return NextResponse.json(
        { error: "communeId est requis" },
        { status: 400 },
      );
    }

    // 5️⃣ Vérifier que la commune existe
    const commune = await prisma.commune.findUnique({
      where: { id: communeId },
    });

    if (!commune) {
      return NextResponse.json(
        { error: "Commune introuvable" },
        { status: 404 },
      );
    }

    // 6️⃣ Update
    const updatedPharmacie = await prisma.pharmacie.update({
      where: { id: pharmacieId },
      data: {
        communeId,
      },
      include: {
        commune: true,
      },
    });

    return NextResponse.json({
      message: "Commune mise à jour avec succès ✅",
      pharmacie: updatedPharmacie,
    });
  } catch (err) {
    console.error("❌ Erreur API PATCH pharmacie:", err);

    return NextResponse.json(
      { error: "Erreur serveur interne" },
      { status: 500 },
    );
  }
}
