//app/api/clientbackend/bondecommandes/[bondecommandeId]/detailsdevis/route.ts
//Ici on recupère  les prix et quantité de chaque produit de l'bondecommande
import { PrismaClient } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ bondecommandeId: string }> },
) {
  try {
    const { bondecommandeId } = await context.params;

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

    // 📦 récupérer bondecommande + items
    const bondecommande = await prisma.bondecommande.findUnique({
      where: { id: bondecommandeId },
      include: {
        items: true,
      },
    });

    if (!bondecommande) {
      return NextResponse.json(
        { error: "Bondecommande introuvable" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      bondecommande,
      items: bondecommande.items,
      prixTotal: bondecommande.prixTotal,
    });
  } catch (error) {
    console.error("❌ Erreur récupération devis:", error);

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
