//api/clientbackend/ordonnances/envoyees/list/route.ts
//Recupérer la liste des ordonnances qui ont été déja payées
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
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

    // 4️⃣ Récupérer toutes les ordonnances PAYEE de cet utilisateur (non supprimées)
    const ordonnances = await prisma.ordonnance.findMany({
      where: {
        userId: user.id,
        statut: "PAYEE",
        deletedAt: null, // ✅ On filtre pour ne prendre que les ordonnances actives
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        imageUrl: true, // ✅ Inclure l’image
        description: true,
        prixTotal: true,
        statut: true,
        createdAt: true,
      },
    });

    // 5️⃣ Répondre avec les données
    return NextResponse.json(
      {
        success: true,
        count: ordonnances.length,
        ordonnances,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ Erreur GET /api/ordonnances/payees/list:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
