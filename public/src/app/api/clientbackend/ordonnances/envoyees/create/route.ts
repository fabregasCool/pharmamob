//api/clientbackend/ordonnances/envoyees/create/route.ts
//Il permet d'envoyer une ordonnance
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // 1️⃣ Vérifier la présence du header Authorization
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
        { status: 401 }
      );
    }

    // 3️⃣ Retrouver l’utilisateur connecté via son email
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 4️⃣ Lire le corps de la requête
    const body = await req.json();
    const { imageUrl, description } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "L’image est obligatoire" },
        { status: 400 }
      );
    }

    // 5️⃣ Créer l’ordonnance dans la base
    const ordonnance = await prisma.ordonnance.create({
      data: {
        userId: user.id,
        imageUrl,
        description: description ?? null,
      },
    });

    // 6️⃣ Retourner la réponse
    return NextResponse.json(
      {
        success: true,
        message: "Ordonnance enregistrée avec succès",
        ordonnance,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Erreur POST /api/ordonnances:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
