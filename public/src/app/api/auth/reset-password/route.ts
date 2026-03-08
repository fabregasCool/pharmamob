// app/api/auth/reset-password/route.ts
import { TokenType } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    const tokenRecord = await prisma.token.findFirst({
      where: { token, type: TokenType.PASSWORD_RESET },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: "Token invalide" }, { status: 400 });
    }

    if (tokenRecord.expires < new Date()) {
      // Nettoyage
      await prisma.token
        .delete({ where: { id: tokenRecord.id } })
        .catch(() => {});
      return NextResponse.json({ error: "Token expiré" }, { status: 400 });
    }

    // Mettre à jour le mot de passe
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: tokenRecord.email },
      data: { passwordHash: hashed },
    });

    // Supprimer le token de reset (one-time)
    await prisma.token.delete({ where: { id: tokenRecord.id } });

    return NextResponse.json({
      success: true,
      message:
        "Mot de passe mis à jour. Retournez sur l'application pour vous connecter",
    });
  } catch (err) {
    console.error("Erreur reset-password:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
