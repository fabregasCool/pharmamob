//app/api/clientbackend/ordonnances/[ordonnanceId]/devis/route.ts
//Ici on recupère  les prix et quantité de chaque produit de l'ordonnance
import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ ordonnanceId: string }> },
) {
  try {
    const { ordonnanceId } = await context.params;

    // 🔐 Vérifier token
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

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

    // 👤 Vérifier utilisateur
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    // 📦 récupérer ordonnance + items
    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: ordonnanceId },
      include: {
        items: true,
      },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      ordonnance,
      items: ordonnance.items,
      prixTotal: ordonnance.prixTotal,
    });
  } catch (error) {
    console.error("❌ Erreur récupération devis:", error);

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
