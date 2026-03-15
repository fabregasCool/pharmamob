//api/pharmaciebackend/ordonnances/[ordonnanceId]/devis/create/route.ts
//Il permet de creer le devis qu'on envoie ensuite au client
import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ ordonnanceId: string }> },
) {
  try {
    const { ordonnanceId } = await context.params;

    const body = await req.json();
    const { items } = body;

    /*
      items attendu :
      [
        { nomProduit:"Paracetamol", quantite:2, prixUnitaire:500 },
        { nomProduit:"Amoxicilline", quantite:1, prixUnitaire:1500 }
      ]
    */

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Aucun médicament fourni" },
        { status: 400 },
      );
    }

    // 1️⃣ Vérifier le token
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 2️⃣ Vérifier le JWT
    let decoded: { email: string };

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        email: string;
      };
    } catch {
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
        { error: "Action réservée aux pharmacies" },
        { status: 403 },
      );
    }

    // 4️⃣ Vérifier l'ordonnance
    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: ordonnanceId },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance introuvable" },
        { status: 404 },
      );
    }

    // 5️⃣ Ajouter les items du devis
    for (const item of items) {
      await prisma.ordonnanceItem.create({
        data: {
          ordonnanceId,
          nomProduit: item.nomProduit,
          quantite: item.quantite,
          prixUnitaire: item.prixUnitaire,
        },
      });
    }

    // 6️⃣ Récupérer tous les items
    const ordonnanceItems = await prisma.ordonnanceItem.findMany({
      where: { ordonnanceId },
    });

    // 7️⃣ Calcul du total
    const total = ordonnanceItems.reduce(
      (sum, i) => sum + i.prixUnitaire * i.quantite,
      0,
    );

    // 8️⃣ Mise à jour ordonnance
    const updatedOrdonnance = await prisma.ordonnance.update({
      where: { id: ordonnanceId },
      data: {
        prixTotal: total,
        statut: "DEVIS_RECU",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Devis envoyé au client",
        prixTotal: total,
        ordonnance: updatedOrdonnance,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ Erreur création devis:", err);

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
