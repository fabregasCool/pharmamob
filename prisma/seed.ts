// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import { usersData } from "./usersData";
import { productsData } from "./productsData";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑 Nettoyage des anciennes données...");
  await prisma.commande.deleteMany();
  await prisma.produit.deleteMany();
  await prisma.pharmacie.deleteMany();
  await prisma.livreur.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Création des utilisateurs...");
  for (const user of usersData) {
    const createdUser = await prisma.user.create({ data: user });

    if (createdUser.role === Role.PHARMACIE) {
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
      for (const product of productsData) {
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
            description: product.description ?? null,
            imageUrl: product.imageUrl ?? null,
            prix: product.prix,
            pharmacieId: pharmacie.id,
            categoryId: category.id, // ✅ clé étrangère valide
          },
        });
      }

      console.log(`💊 Produits ajoutés à la pharmacie ${createdUser.name}`);
    }

    if (createdUser.role === Role.LIVREUR) {
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

    if (createdUser.role === Role.CLIENT) {
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

    if (createdUser.role === Role.ADMIN) {
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
