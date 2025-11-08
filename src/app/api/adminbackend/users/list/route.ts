// /api/adminbackend/users/list/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    let decoded: { email: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
    } catch {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 401 });
    }

    // Vérifier admin
    const admin = await prisma.user.findUnique({
      where: { email: decoded.email },
      select: { id: true, role: true },
    });
    if (!admin) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    if (admin.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    // Requête efficace : on récupère les users + relations clés + compteurs
    // NB: on limite les produits renvoyés aux champs nécessaires (id, title, prix)
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        pharmacies: {
          select: {
            id: true,
            name: true,
            ville: true,
            commune: true,
            produits: { select: { id: true, title: true, prix: true } }, // si tu veux un aperçu
          },
        },
        _count: {
          select: {
            ordonnances: true,
            bondecommandes: true,
          },
        },
        cart: {
          select: {
            id: true,
            // items: { select: { ... } } // à ajouter seulement si nécessaire
          },
        },
        client: true,
        livreur: true,
      },
      take: 200, // sécurité — limite par défaut (ajoute pagination propre plus bas)
    });

    // Transformer en JSON sérialisable et ajouter totaux
    const usersWithCounts = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      role: u.role,
      isVerified: u.isVerified,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt?.toISOString(),
      pharmaciesCount: u.pharmacies.length,
      produitsCount: u.pharmacies.reduce((acc, ph) => acc + (ph.produits?.length ?? 0), 0),
      ordonnancesCount: u._count?.ordonnances ?? 0,
      bondecommandesCount: u._count?.bondecommandes ?? 0,
      pharmacies: u.pharmacies.map((ph) => ({
        id: ph.id,
        name: ph.name,
        ville: ph.ville,
        commune: ph.commune,
        produits: ph.produits?.map((p) => ({ id: p.id, title: p.title, prix: p.prix })) ?? [],
        produitsCount: ph.produits?.length ?? 0,
      })),
      cart: u.cart ? { id: u.cart.id } : null,
      client: u.client ?? null,
      livreur: u.livreur ?? null,
    }));

    return NextResponse.json({ success: true, count: usersWithCounts.length, users: usersWithCounts }, { status: 200 });
  } catch (err) {
    console.error("❌ Erreur /api/adminbackend/users/list :", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
