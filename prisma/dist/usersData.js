"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersData = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const password = bcryptjs_1.default.hashSync("password", 10);
exports.usersData = [
    {
        name: "Admin Système",
        email: "admin@test.com",
        phone: "+2250101010101",
        passwordHash: password,
        role: client_1.Role.ADMIN,
        isVerified: true,
    },
    {
        name: "Pharmacie Express",
        email: "pharmacie@test.com",
        phone: "+2250202020202",
        passwordHash: password,
        role: client_1.Role.PHARMACIE,
        isVerified: true,
    },
    {
        name: "Livreur Express",
        email: "livreur@test.com",
        phone: "+2250505050505",
        passwordHash: password,
        role: client_1.Role.LIVREUR,
        isVerified: true,
    },
    {
        name: "Client Tester",
        email: "client@test.com",
        phone: "+2250606060606",
        passwordHash: password,
        role: client_1.Role.CLIENT,
        isVerified: true,
    },
];
