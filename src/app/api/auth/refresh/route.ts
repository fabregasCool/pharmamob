// app/api/auth/refresh/route.ts
import { PrismaClient, TokenType } from "@prisma/client";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "refreshToken requis" },
        { status: 400 }
      );
    }

    // 🔍 Chercher le refreshToken dans la base
    const tokenRecord = await prisma.token.findFirst({
      where: { token: refreshToken, type: TokenType.REFRESH },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Refresh token invalide" },
        { status: 401 }
      );
    }

    // 🔍 Vérifier expiration
    const now = new Date();
    if (tokenRecord.expires < now) {
      return NextResponse.json(
        { error: "Refresh token expiré" },
        { status: 401 }
      );
    }

    // 🔍 Chercher l'utilisateur correspondant
    const user = await prisma.user.findUnique({
      where: { email: tokenRecord.email },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // 🔑 Générer nouveau accessToken
    const newAccessToken = jwt.sign(
      { email: user.email, role: user.role, userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "5m" }
    );

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      accessTokenExpiresIn: 5 * 60, // 900s
      refreshToken: tokenRecord.token,
      refreshTokenExpiry: tokenRecord.expires.toISOString(), // 🔹 date d’expiration
    });
  } catch (err) {
    console.error("❌ Erreur refresh:", err);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
