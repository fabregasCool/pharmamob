import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ pharmacieId: string }> }
) {
  try {
    // 1️⃣ Récupérer et attendre les paramètres
    const { pharmacieId } = await context.params;

    // 2️⃣ Vérifier le token d’authentification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 3️⃣ Vérifier et décoder le JWT
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

    // 4️⃣ Vérifier si l’utilisateur existe et est un client
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
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

    // 5️⃣ Récupérer le paramètre de recherche `q`
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    // 6️⃣ Requête Prisma : chercher dans les produits de la pharmacie
    const produits = await prisma.produit.findMany({
      where: {
        deletedAt: null,
        pharmacieId: pharmacieId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      include: {
        pharmacie: { select: { name: true, commune: true } },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, produits });
  } catch (err) {
    console.error(
      "❌ Erreur GET /api/clientbackend/produits/[pharmacieId]/search:",
      err
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
