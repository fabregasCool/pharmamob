// app/api/auth/forgot-password/route.ts
import { PrismaClient, TokenType } from "@prisma/client";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const REQUEST_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Si l'email existe, un lien a été envoyé.",
      });
    }

    const existingToken = await prisma.token.findFirst({
      where: {
        email,
        type: TokenType.PASSWORD_RESET,
        expires: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingToken) {
      const elapsed = Date.now() - existingToken.createdAt.getTime();
      if (elapsed < REQUEST_INTERVAL_MS) {
        return NextResponse.json({
          success: true,
          message:
            "Un lien a déjà été envoyé récemment. Vérifiez vos emails ou réessayez plus tard.",
        });
      }
    }

    await prisma.token.deleteMany({
      where: { email, type: TokenType.PASSWORD_RESET },
    });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.token.create({
      data: {
        token: resetToken,
        type: TokenType.PASSWORD_RESET,
        email,
        expires,
      },
    });

    const resetUrl = `${
      process.env.APP_URL ?? "http://localhost:3000"
    }/reset-password?token=${resetToken}`;
    console.log("Reset URL:", resetUrl);

    if (resend) {
      await resend.emails.send({
        from: process.env.MAIL_FROM || "no-reply@pharmamobapp.com",
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        html: `
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <p>
            <a href="${resetUrl}" 
               style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;background:#4F46E5;color:#fff;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p>Ce lien expire dans 5 minutes.</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        `,
      });
    } else {
      console.warn("⚠️ RESEND_API_KEY manquante — aucun email envoyé");
    }

    return NextResponse.json({
      success: true,
      message: "Si l'email existe, un lien a été envoyé.",
    });
  } catch (error) {
    console.error("Erreur forgot-password:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
