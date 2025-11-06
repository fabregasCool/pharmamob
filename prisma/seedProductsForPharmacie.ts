// prisma/seedProductsForPharmacie.ts
import { PrismaClient } from "@prisma/client";
import { productsData } from "./productsData";

const prisma = new PrismaClient();

/**
 * Ajoute toutes les catégories & produits du fichier productsData
 * pour la pharmacie identifiée par `pharmacieId`.
 */
export async function seedProductsForPharmacie(pharmacieId: string) {
  try {
    for (const product of productsData) {
      // 1) Cherche la catégorie par nom
      let category = await prisma.category.findUnique({
        where: { name: product.category },
      });

      // 2) Si inexistante, la crée
      if (!category) {
        category = await prisma.category.create({
          data: { name: product.category },
        });
      }

      // 3) Crée le produit lié à la pharmacie & à la catégorie
      await prisma.produit.create({
        data: {
          title: product.title,
          description: product.description ?? null,
          imageUrl: product.imageUrl ?? null,
          prix: product.prix,
          pharmacieId,
          categoryId: category.id,
        },
      });
    }

    console.log(`💊 Products seeded for pharmacie ${pharmacieId}`);
  } catch (error) {
    console.error("❌ Erreur seedProductsForPharmacie:", error);
    throw error;
  } finally {
    // Ne pas disconnect ici si tu veux réutiliser le même prisma elsewhere.
    // On se contente de ne rien faire pour laisser le caller gérer la déconnexion.
  }
}
