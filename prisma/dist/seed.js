"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
const client_1 = require("@prisma/client");
const usersData_1 = require("./usersData");
const productsData_1 = require("./productsData");
const prisma = new client_1.PrismaClient();
async function main() {
    var _a, _b;
    console.log("🗑 Nettoyage des anciennes données...");
    await prisma.commande.deleteMany();
    await prisma.produit.deleteMany();
    await prisma.pharmacie.deleteMany();
    await prisma.livreur.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();
    console.log("👤 Création des utilisateurs...");
    for (const user of usersData_1.usersData) {
        const createdUser = await prisma.user.create({ data: user });
        if (createdUser.role === client_1.Role.PHARMACIE) {
            // 👉 Créer la pharmacie liée
            const pharmacie = await prisma.pharmacie.create({
                data: {
                    name: `${createdUser.name}`,
                    ville: "Abidjan",
                    commune: "Yopougon",
                    quartier: "Millionnaire",
                    phone: "+2250707070707",
                    userId: createdUser.id,
                },
            });
            console.log(`🏪 Pharmacie créée pour ${createdUser.email}`);
            // 👉 Ajouter les produits de test à la pharmacie
            for (const product of productsData_1.productsData) {
                // Vérifie si la catégorie existe déjà
                let category = await prisma.category.findUnique({
                    where: { name: product.category },
                });
                // Si elle n'existe pas, on la crée
                if (!category) {
                    category = await prisma.category.create({
                        data: { name: product.category },
                    });
                }
                // Crée le produit avec la clé étrangère categoryId
                await prisma.produit.create({
                    data: {
                        title: product.title,
                        description: (_a = product.description) !== null && _a !== void 0 ? _a : null,
                        imageUrl: (_b = product.imageUrl) !== null && _b !== void 0 ? _b : null,
                        prix: product.prix,
                        pharmacieId: pharmacie.id,
                        categoryId: category.id, // ✅ clé étrangère valide
                    },
                });
            }
            console.log(`💊 Produits ajoutés à la pharmacie ${createdUser.name}`);
        }
        if (createdUser.role === client_1.Role.LIVREUR) {
            // 👉 Créer le livreur lié
            await prisma.livreur.create({
                data: {
                    userId: createdUser.id,
                    ville: "Abidjan",
                    commune: "Koumassi",
                    quartier: "Divo",
                },
            });
            console.log(`🚚 Livreur créé pour ${createdUser.email}`);
        }
        if (createdUser.role === client_1.Role.CLIENT) {
            // 👉 Créer le client lié
            await prisma.client.create({
                data: {
                    adresse: "Cocody Angré 8ème Tranche",
                    ville: "Abidjan",
                    commune: "Cocody",
                    quartier: "Angré",
                    phone: "+2250101010101",
                    userId: createdUser.id,
                },
            });
            console.log(`🧑‍💻 Client créé pour ${createdUser.email}`);
        }
        if (createdUser.role === client_1.Role.ADMIN) {
            console.log(`⭐ Admin créé : ${createdUser.email}`);
        }
    }
    console.log("✅ Seeding terminé !");
}
main()
    .catch((e) => {
    console.error("❌ Erreur lors du seeding", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
