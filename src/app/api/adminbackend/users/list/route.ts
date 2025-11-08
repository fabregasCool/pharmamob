import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // 1️⃣ Vérification du token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 401 }
      );
    }

    // 2️⃣ Vérifier si l'utilisateur est admin
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

    // 3️⃣ Récupérer tous les utilisateurs + leurs données liées
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        pharmacies: {
          include: {
            produits: true,
          },
        },
        ordonnances: true,
        bondecommandes: true,
      },
    });

    // 4️⃣ Transformer pour ajouter les compteurs
    const usersWithCounts = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
      pharmaciesCount: u.pharmacies.length,
      produitsCount: u.pharmacies.reduce(
        (acc, ph) => acc + ph.produits.length,
        0
      ),
      ordonnancesCount: u.ordonnances.length,
      bondecommandesCount: u.bondecommandes.length,
      pharmacies: u.pharmacies.map((ph) => ({
        id: ph.id,
        name: ph.name,
        ville: ph.ville,
        commune: ph.commune,
        produits: ph.produits.map((p) => ({
          id: p.id,
          title: p.title,
          prix: p.prix,
        })),
      })),
    }));

    // 5️⃣ Réponse JSON
    return NextResponse.json(
      {
        success: true,
        count: usersWithCounts.length,
        users: usersWithCounts,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Erreur /api/adminbackend/users/list :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
