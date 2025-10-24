import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const password = bcrypt.hashSync("password", 10);

export const usersData = [
  {
    name: "Admin Système",
    email: "admin@test.com",
    phone: "+2250101010101",
    passwordHash: password,
    role: Role.ADMIN,
    isVerified: true,
  },
  {
    name: "Fabregas",
    email: "fabregas@test.com",
    phone: "+2250202020202",
    passwordHash: password,
    role: Role.PHARMACIE,
    isVerified: true,
  },
  {
    name: "Livreur Express",
    email: "livreur@test.com",
    phone: "+2250505050505",
    passwordHash: password,
    role: Role.LIVREUR,
    isVerified: true,
  },
  {
    name: "Client Test",
    email: "client@test.com",
    phone: "+2250606060606",
    passwordHash: password,
    role: Role.CLIENT,
    isVerified: true,
  },
];
