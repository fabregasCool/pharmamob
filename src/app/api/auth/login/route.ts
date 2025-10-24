// app/api/auth/login/route.ts
import { PrismaClient, TokenType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const prisma = new PrismaClient();

// 📌 Validation
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(7, "Mot de passe requis"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // 🔍 Vérifier l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 400 }
      );
    }

    // 🔍 Vérifier mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 400 }
      );
    }

    // 🚮 Supprimer les anciens refresh tokens
    await prisma.token.deleteMany({
      where: { email: user.email, type: TokenType.REFRESH },
    });

    // 🔑 Créer Access Token (15 min)
    const accessToken = jwt.sign(
      { email: user.email, role: user.role, userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "5m" }
    );

    // 🔑 Créer Refresh Token (7 jours)
    const refreshToken = crypto.randomBytes(48).toString("hex");
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.token.create({
      data: {
        email: user.email,
        token: refreshToken,
        expires: refreshExpires,
        type: TokenType.REFRESH,
      },
    });

    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      accessTokenExpiresIn: 5 * 60, // en secondes
      refreshTokenExpiry: refreshExpires.toISOString(), // 🔹 date expiration du refreshToken
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues.map((i) => i.message) },
        { status: 400 }
      );
    }
    console.error("❌ Erreur login:", err);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
