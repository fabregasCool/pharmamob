// app/api/profile/update/password/route.ts
//Permet de mettre à jour le mot de passe d'un utilisateur
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();

// 📌 Validation du corps de la requête
const passwordSchema = z.object({
  oldPassword: z.string().min(7, "Ancien mot de passe trop court"),
  newPassword: z.string().min(7, "Nouveau mot de passe trop court"),
});

export async function PUT(req: Request) {
  try {
    // 1️⃣ Vérifier le token JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

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

    // 2️⃣ Lire et valider le body
    const body = await req.json();
    const { oldPassword, newPassword } = passwordSchema.parse(body);

    // 3️⃣ Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // 4️⃣ Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Ancien mot de passe incorrect" },
        { status: 400 }
      );
    }

    // 5️⃣ Hacher et mettre à jour le nouveau mot de passe
    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // 6️⃣ Réponse succès
    return NextResponse.json({
      success: true,
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    // Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((err) => err.message) },
        { status: 400 }
      );
    }

    console.error("Erreur API update password :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
