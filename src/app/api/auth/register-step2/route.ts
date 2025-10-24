// 📌 Importation des modules nécessaires
import { PrismaClient, Role } from "@prisma/client"; // ORM pour interagir avec la base de données
import bcrypt from "bcryptjs"; // Pour hacher les mots de passe
import { NextResponse } from "next/server"; // Pour formater les réponses Next.js API
import { z } from "zod"; // Pour la validation des données

// 🔹 Initialisation de Prisma
const prisma = new PrismaClient();

// 📌 Schéma de validation des données entrantes
const requestSchema = z.object({
  otpCode: z.string().min(4, "Code OTP trop court"),
  name: z.string().min(1, "Nom requis"),
  phone: z
    .string()
    .regex(
      /^(0|4|5|6|7|8|9)\d{9}$/,
      "Numéro invalide : doit contenir 10 chiffres et commencer par 0,4,5,6,7,8 ou 9"
    ),
  password: z.string().min(7, "Mot de passe trop court"),
  role: z.string().min(1, "Rôle requis"),
});

// 🔹 Route POST pour valider un utilisateur via un OTP
export async function POST(req: Request) {
  try {
    // 1️⃣ Lecture et validation des données envoyées par le client
    const body = await req.json();
    const { otpCode, name, phone, password, role } = requestSchema.parse(body);

    // 2️⃣ Recherche de l’OTP valide ET récupération de l’utilisateur associé
    const otp = await prisma.otp.findFirst({
      where: {
        code: otpCode,
        expiresAt: { gt: new Date() }, // OTP encore valide
      },
      include: {
        user: true, // Récupération directe de l'utilisateur lié
      },
    });

    // 3️⃣ Si l’OTP est introuvable ou expiré, on retourne une erreur
    if (!otp) {
      return NextResponse.json(
        { error: "OTP invalide ou expiré" },
        { status: 400 }
      );
    }

    // 4️⃣ Hachage du mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // 5️⃣ Mise à jour de l'utilisateur lié à cet OTP
    await prisma.user.update({
      where: { id: otp.user.id },
      data: {
        name,
        phone,
        passwordHash,
        role: role as Role, // Conversion explicite vers l'Enum
        isVerified: true,
      },
    });

    // 6️⃣ Suppression de l'OTP pour éviter toute réutilisation future
    await prisma.otp.delete({ where: { id: otp.id } });

    // 7️⃣ Retour d'une réponse de succès
    return NextResponse.json({ success: true });
  } catch (error) {
    // 📌 Gestion des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((err) => err.message) }, // ✅ utiliser .issues
        { status: 400 }
      );
    }

    // 📌 Gestion des erreurs internes
    console.error("Erreur serveur :", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
