// app/api/auth/register-step1/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Chercher l'utilisateur
    let user = await prisma.user.findUnique({ where: { email } });

    // L'utilisateur s'est déja connecté une fois
    if (user && user.isVerified) {
      return NextResponse.json(
        {
          error:
            "Cet utilisateur est déjà inscrit et vérifié, initialiser votre mot de passe",
        },
        { status: 400 }
      );
    }

    // Si l'utilisateur n'existe pas -> on le crée
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: "",
          phone: "",
          passwordHash: "",
          role: "PHARMACIE", // ou LIVREUR selon besoin
        },
      });
    }

    // Supprimer anciens OTP non utilisés pour éviter doublons
    await prisma.otp.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Générer OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Expire après 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Sauvegarder OTP
    await prisma.otp.create({
      data: {
        code: otpCode,
        userId: user.id,
        expiresAt,
      },
    });

    // Envoi par Resend

    const result = await resend.emails.send({
      // from: "onboarding@resend.dev",
      from: "no-reply@pharmamobapp.com", // ✅ ton domaine personnalisé
      to: email,
      subject: "Votre code de vérification",
      html: `
        <p>Bonjour,</p>
        <p>Voici votre code de vérification :</p>
        <h2>${otpCode}</h2>
        <p>Ce code est valide pendant 10 minutes.</p>
      `,
    });
    console.log("Resend result:", result);

    return NextResponse.json({
      message: "OTP envoyé ou régénéré avec succès",
      userId: user.id,
    });
  } catch (error) {
    console.error("Erreur register-step1:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
