"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    await prisma.commune.deleteMany();
    console.log("🏙 Création des communes d'Abidjan...");
    const communesAbidjan = [
        "Abobo",
        "Adjamé",
        "Anyama",
        "Attécoubé",
        "Bingerville",
        "Cocody",
        "Koumassi",
        "Marcory",
        "Plateau",
        "Port-Bouët",
        "Songon",
        "Treichville",
        "Yopougon",
    ];
    // ✅ Type correct pour TypeScript
    const communesMap = {};
    for (const name of communesAbidjan) {
        const commune = await prisma.commune.create({ data: { name } });
        communesMap[name] = commune; // on garde les ids pour le connect
    }
    console.log("👤 Création des utilisateurs...");
    for (const user of usersData_1.usersData) {
        const createdUser = await prisma.user.create({ data: user });
        if (createdUser.role === client_1.Role.PHARMACIE) {
            const communeName = "Yopougon";
            const pharmacie = await prisma.pharmacie.create({
                data: {
                    name: `${createdUser.name}`,
                    commune: { connect: { id: communesMap[communeName].id } },
                    quartier: "Millionnaire",
                    phone: "+2250707070707",
                    user: { connect: { id: createdUser.id } },
                },
            });
            console.log(`🏪 Pharmacie créée pour ${createdUser.email}`);
            for (const product of productsData_1.productsData) {
                let category = await prisma.category.findUnique({
                    where: { name: product.category },
                });
                if (!category) {
                    category = await prisma.category.create({
                        data: { name: product.category },
                    });
                }
                await prisma.produit.create({
                    data: {
                        title: product.title,
                        description: (_a = product.description) !== null && _a !== void 0 ? _a : null,
                        imageUrl: (_b = product.imageUrl) !== null && _b !== void 0 ? _b : null,
                        prix: product.prix,
                        pharmacieId: pharmacie.id,
                        categoryId: category.id,
                    },
                });
            }
        }
        if (createdUser.role === client_1.Role.LIVREUR) {
            const communeName = "Koumassi";
            await prisma.livreur.create({
                data: {
                    user: { connect: { id: createdUser.id } },
                    commune: { connect: { id: communesMap[communeName].id } },
                    quartier: "Divo",
                },
            });
            console.log(`🚚 Livreur créé pour ${createdUser.email}`);
        }
        if (createdUser.role === client_1.Role.CLIENT) {
            const communeName = "Cocody";
            await prisma.client.create({
                data: {
                    user: { connect: { id: createdUser.id } },
                    commune: { connect: { id: communesMap[communeName].id } },
                    quartier: "Angré",
                    phone: "+2250101010101",
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
