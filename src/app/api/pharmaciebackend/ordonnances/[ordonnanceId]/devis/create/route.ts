//api/pharmaciebackend/ordonnances/[ordonnanceId]/devis/create/route.ts
//Il permet de creer le devis qu'on envoie ensuite au client
import { PrismaClient, Prisma } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// ✅ Type propre
type OrdonnanceItemInput = {
  nomProduit: string;
  quantite: number;
  prixUnitaire: number;
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ ordonnanceId: string }> },
) {
  try {
    const { ordonnanceId } = await context.params;

    const body = await req.json();
    const { items }: { items: OrdonnanceItemInput[] } = body;

    // ✅ Vérification items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Aucun médicament fourni" },
        { status: 400 },
      );
    }

    // ✅ Validation stricte
    if (
      !items.every(
        (item) =>
          typeof item.nomProduit === "string" &&
          typeof item.quantite === "number" &&
          typeof item.prixUnitaire === "number",
      )
    ) {
      return NextResponse.json(
        { error: "Format des données invalide" },
        { status: 400 },
      );
    }

    // 🔐 Vérification token
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

    // 👤 Vérification user
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

    // 📄 Vérifier ordonnance
    const ordonnance = await prisma.ordonnance.findUnique({
      where: { id: ordonnanceId },
    });

    if (!ordonnance) {
      return NextResponse.json(
        { error: "Ordonnance introuvable" },
        { status: 404 },
      );
    }

    // 💰 CALCUL AVANT INSERTION (IMPORTANT 🔥)
    const total = items.reduce(
      (sum, item) =>
        sum.plus(new Prisma.Decimal(item.prixUnitaire).mul(item.quantite)),
      new Prisma.Decimal(0),
    );

    const totalNumber = total.toNumber();

    // 🚫 BLOQUER SI > 300 000
    if (totalNumber > 300000) {
      return NextResponse.json(
        { error: "Refusé : montant trop élevé (max 300 000 FCFA)" },
        { status: 400 },
      );
    }

    // 🧹 SUPPRIMER ANCIEN DEVIS (TRÈS IMPORTANT)
    await prisma.ordonnanceItem.deleteMany({
      where: { ordonnanceId },
    });

    // 🚀 INSERT NOUVEAU DEVIS
    await prisma.ordonnanceItem.createMany({
      data: items.map((item) => ({
        ordonnanceId,
        nomProduit: item.nomProduit,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
      })),
    });

    // 📝 UPDATE ORDONNANCE
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
        prixTotal: totalNumber,
        ordonnance: updatedOrdonnance,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ Erreur création devis:", err);

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
