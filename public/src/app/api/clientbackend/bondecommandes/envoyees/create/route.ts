// api/clientbackend/bondecommandes/envoyees/create/route.ts
// Il permet d'envoyer une bon de commande

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();

// 📌 Validation du corps de la requête
const bonDeCommandeSchema = z.object({
  imageUrl: z.string().url("L’URL de l’image est invalide"),
  description: z.string().optional(),
  securite_sociale: z
    .string()
    .regex(
      /^\d{13}$/,
      "Le numéro de sécurité sociale doit contenir exactement 13 chiffres"
    ),
});

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

    // 4️⃣ Lire et valider le corps de la requête
    const body = await req.json();
    const parsed = bonDeCommandeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { imageUrl, description, securite_sociale } = parsed.data;

    // 5️⃣ Créer la bon de commande dans la base
    const bondecommande = await prisma.bondecommande.create({
      data: {
        userId: user.id,
        imageUrl,
        description: description ?? null,
        securite_sociale,
      },
    });

    // 6️⃣ Retourner la réponse
    return NextResponse.json(
      {
        success: true,
        message: "Bon de commande enregistrée avec succès",
        bondecommande,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Erreur POST /api/bondecommandes:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
