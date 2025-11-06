// prisma/productsData.ts
type ProductSeed = {
  title: string;
  description?: string;
  imageUrl?: string;
  prix: number;
  category: string; // ✅ Ajout du champ catégorie
};

export const productsData: ProductSeed[] = [
  // --- ANTALGIQUES / ANTIINFLAMMATOIRES
  {
    title: "Doliprane 500mg (Paracétamol)",
    description:
      "Antalgiques/antipyrétique — boîte 8/16 comprimés selon dosage",
    prix: 800,
    category: "MEDICAMENT",
  },

  {
    title: "Efferalgan (Paracétamol effervescent)",
    description: "Paracétamol effervescent, calme la fièvre et la douleur",
    prix: 1200,
    category: "MEDICAMENT",
  },
  {
    title: "Algésic (Paracétamol/combinaison)",
    description: "Antalgique (nom commercial local)",
    prix: 800,
    category: "MEDICAMENT",
  },
  {
    title: "Brufen (Ibuprofène 200mg)",
    description: "Anti-inflammatoire non stéroïdien pour douleurs et fièvre",
    prix: 1000,
    category: "MEDICAMENT",
  },
  {
    title: "Diclofenac (Dynapar / Voltarène / Diclo)",
    description: "Anti-inflammatoire (gel ou comprimés selon version)",
    prix: 1800,
    category: "MEDICAMENT",
  },

  {
    title: "Celecoxib (Celebrex)",
    description: "AINS sélectif — anti-inflammatoire pour douleurs chroniques",
    prix: 7000,
    category: "MEDICAMENT",
  },
  {
    title: "Codoliprane (Paracétamol + codéine)",
    description: "Antalgique combiné (peut nécessiter prescription)",
    prix: 1200,
    category: "MEDICAMENT",
  },
  {
    title: "Novalgin (Métamizole)",
    description: "Antalgique puissant (utilisé sous surveillance)",
    prix: 900,
    category: "MEDICAMENT",
  },
  {
    title: "Paracétamol 500mg",
    description: "Soulage la fièvre et les douleurs légères à modérées.",
    prix: 800,
    category: "MEDICAMENT",
  },
  // --- ANTIBIOTIQUES
  {
    title: "Amoxicilline 500mg",
    description:
      "Antibiotique bêta-lactame — infections ORL, respiratoires, etc.",
    prix: 900,
    category: "MEDICAMENT",
  },
  {
    title: "Amoxicilline + Acide clavulanique (Augmentin / Amoxiclav)",
    description: "Association antibiotique à spectre élargi",
    prix: 1600,
    category: "MEDICAMENT",
  },
  {
    title: "Azithromycine (Azithro / Azix)",
    description: "Macrolide — infections respiratoires, ORL",
    prix: 1200,
    category: "MEDICAMENT",
  },
  {
    title: "Cefixime (Cefixim)",
    description: "Céphalosporine orale — infections bactériennes",
    prix: 2000,
    category: "MEDICAMENT",
  },
  {
    title: "Metronidazole (Flagyl / Metronyl)",
    description: "Antiprotozoaire/antibiotique pour infections anaérobies",
    prix: 800,
    category: "MEDICAMENT",
  },

  // --- ANTIPALUDEENS
  {
    title: "Artefan (Arteméther-luméfantrine)",
    description: "Antipaludéen ACT — traitement du paludisme",
    prix: 2500,
    category: "MEDICAMENT",
  },
  {
    title: "Paludrine / Chloroquine (selon disponibilité)",
    description: "Antipaludéen (selon protocole local)",
    prix: 1500,
    category: "MEDICAMENT",
  },
  // --- COMPLEMENTS / ANEMIE
  {
    title: "Feramalt (préparation ferreuse)",
    description: "Complément ferreux pour anémie",
    prix: 3000,
    category: "COMPLEMENTS",
  },
  {
    title: "Hb Plus (supplément fer/folate)",
    description: "Complément pour anémie (formule multi)",
    prix: 2800,
    category: "COMPLEMENTS",
  },
  {
    title: "Acfol (acide folique)",
    description: "Acide folique / vitamine B9 pour grossesse/anémie",
    prix: 1200,
    category: "COMPLEMENTS",
  },
  {
    title: "Ferplex / Orofer / Hemafer (compléments fer)",
    description: "Différentes marques de compléments en fer",
    prix: 3200,
    category: "COMPLEMENTS",
  },
  {
    title: "Vitamine C 1000mg",
    description: "Complément pour renforcer le système immunitaire.",
    prix: 2500,
    category: "COMPLEMENTS",
  },
  {
    title: "Zincovit",
    description:
      "Complément multivitaminé et minéral pour renforcer le système immunitaire et améliorer la vitalité.",
    prix: 5000,
    category: "COMPLEMENTS",
  },
  {
    title: "Supradyn Energy",
    description:
      "Complexe de vitamines et minéraux pour combattre la fatigue et booster l'énergie quotidienne.",
    prix: 6500,
    category: "COMPLEMENTS",
  },
  {
    title: "Calcium Sandoz 500mg",
    description:
      "Supplément de calcium pour renforcer les os et prévenir les carences.",
    prix: 4000,
    category: "COMPLEMENTS",
  },
  {
    title: "Magnesium B6",
    description:
      "Aide à réduire la fatigue et à soutenir le bon fonctionnement du système nerveux.",
    prix: 3500,
    category: "COMPLEMENTS",
  },
  {
    title: "Vitamin D3 1000 UI",
    description:
      "Contribue au maintien d’une ossature normale et au bon fonctionnement du système immunitaire.",
    prix: 3000,
    category: "COMPLEMENTS",
  },
  {
    title: "Vitabiotics Wellwoman",
    description:
      "Complément multivitaminé spécialement formulé pour les besoins des femmes actives.",
    prix: 9000,
    category: "COMPLEMENTS",
  },
  {
    title: "Vitabiotics Wellman",
    description:
      "Multivitamines pour hommes, soutient la vitalité et les performances physiques et mentales.",
    prix: 9000,
    category: "COMPLEMENTS",
  },
  {
    title: "Centrum Energy",
    description:
      "Complément multivitaminé complet pour améliorer la forme et l'énergie au quotidien.",
    prix: 8500,
    category: "COMPLEMENTS",
  },
  {
    title: "Spiruline Naturelle 500mg",
    description:
      "Source naturelle de protéines, fer et vitamines, idéale pour la vitalité et la récupération.",
    prix: 7000,
    category: "COMPLEMENTS",
  },
  {
    title: "Oméga 3 (huile de poisson)",
    description:
      "Contribue au bon fonctionnement du cœur, du cerveau et de la vision.",
    prix: 6000,
    category: "COMPLEMENTS",
  },

  // --- BEAUTE & HYGIENE
  {
    title: "Crème Nivea Soft 200ml",
    description:
      "Hydrate en profondeur la peau du visage et du corps, texture légère et non grasse.",
    prix: 4500,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Savon Dove Original 100g",
    description:
      "Nettoie la peau tout en la nourrissant grâce à sa crème hydratante intégrée.",
    prix: 1200,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Déodorant Spray Rexona Invisible 200ml",
    description:
      "Protège efficacement contre la transpiration et les mauvaises odeurs sans tacher les vêtements.",
    prix: 3500,
    category: "BEAUTE_HYGIENE",
  },

  {
    title: "Crème Hydratante Visage 50ml",
    description: "Hydratation quotidienne pour peau sèche",
    prix: 6000,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Gel Hydroalcoolique 100ml",
    description: "Désinfecte efficacement les mains sans eau",
    prix: 1500,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Gel Hydroalcoolique 100ml",
    description: "Désinfecte efficacement les mains sans eau.",
    prix: 1500,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Shampooing Pantene Pro-V 200ml",
    description: "Renforce les cheveux et les rend brillants et soyeux.",
    prix: 4000,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Après-Shampooing Garnier 200ml",
    description: "Démêle et nourrit intensément les cheveux.",
    prix: 3800,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Brosse à dents Colgate Souple",
    description: "Pour un brossage efficace et doux sur les gencives.",
    prix: 1200,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Dentifrice Colgate Max Fresh 100g",
    description: "Assure une haleine fraîche et des dents propres.",
    prix: 1500,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Savon Liquide Palmolive 250ml",
    description: "Nettoie et hydrate les mains en douceur.",
    prix: 1800,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Cotons Démaquillants 50pcs",
    description: "Idéal pour retirer le maquillage délicatement.",
    prix: 1000,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Crème Solaire Nivea SPF50 100ml",
    description: "Protège la peau des rayons UV tout en l'hydratant.",
    prix: 5500,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Bain de bouche Listerine 250ml",
    description: "Réduit les bactéries et rafraîchit l’haleine.",
    prix: 2500,
    category: "BEAUTE_HYGIENE",
  },

  // --- CHEVEUX
  {
    title: "Shampoing Antipelliculaire 250ml",
    description: "Élimine les pellicules et apaise le cuir chevelu",
    prix: 3500,
    category: "CHEVEUX",
  },
  {
    title: "Masque capillaire / keratine 200ml",
    description: "Répare et nourrit les cheveux abîmés",
    prix: 9000,
    category: "CHEVEUX",
  },
  {
    title: "Shampoing Antichute Elsève 250ml",
    description:
      "Renforce les racines et réduit la chute des cheveux grâce à sa formule enrichie en arginine.",
    prix: 4000,
    category: "CHEVEUX",
  },
  {
    title: "Huile de Ricin Pure 100ml",
    description:
      "Favorise la pousse des cheveux et les rend plus forts et brillants.",
    prix: 3500,
    category: "CHEVEUX",
  },
  {
    title: "Masque Capillaire Shea Moisture Karité & Huile de Coco 340g",
    description:
      "Nourrit intensément les cheveux secs et cassants, redonne souplesse et éclat.",
    prix: 9500,
    category: "CHEVEUX",
  },
  {
    title: "Sérum Anti-Frisottis Garnier Fructis 50ml",
    description:
      "Lisse les cheveux et apporte une brillance durable tout en les protégeant de la chaleur.",
    prix: 5000,
    category: "CHEVEUX",
  },
  {
    title: "Shampoing Hydratant Dove 250ml",
    description: "Hydrate et adoucit les cheveux secs et ternes.",
    prix: 3200,
    category: "CHEVEUX",
  },
  {
    title: "Après-Shampoing Garnier Fructis 200ml",
    description: "Démêle et nourrit les cheveux en profondeur.",
    prix: 3500,
    category: "CHEVEUX",
  },
  {
    title: "Huile d'Argan Pure 50ml",
    description: "Répare, nourrit et protège les cheveux abîmés.",
    prix: 6000,
    category: "CHEVEUX",
  },
  {
    title: "Spray Thermoprotecteur L’Oréal 150ml",
    description: "Protège les cheveux de la chaleur des fers et sèche-cheveux.",
    prix: 4500,
    category: "CHEVEUX",
  },
  {
    title: "Gel Coiffant Strong Hold 150ml",
    description:
      "Maintient la coiffure toute la journée sans alourdir les cheveux.",
    prix: 3000,
    category: "CHEVEUX",
  },
  {
    title: "Shampoing Sec Batiste 200ml",
    description:
      "Rafraîchit les cheveux entre deux lavages et apporte du volume.",
    prix: 4000,
    category: "CHEVEUX",
  },
  {
    title: "Masque Réparateur L’Oréal 200ml",
    description: "Répare les cheveux abîmés et leur redonne douceur et éclat.",
    prix: 8500,
    category: "CHEVEUX",
  },
  {
    title: "Crème Coiffante Cantu 227g",
    description:
      "Définition des boucles et hydratation des cheveux crépus et frisés.",
    prix: 5500,
    category: "CHEVEUX",
  },
  {
    title: "Brosse Démêlante Tangle Teezer",
    description: "Démêle facilement tous types de cheveux sans douleur.",
    prix: 7000,
    category: "CHEVEUX",
  },

  // --- BEBE & MAMAN
  {
    title: "Lait de Toilette Bébé 500ml",
    description: "Nettoie et hydrate la peau délicate des nourrissons",
    prix: 4000,
    category: "BEBE_MAMAN",
  },
  {
    title: "Coffret Bébé (body + pyjama)",
    description: "Petit coffret textile pour nouveau-né",
    prix: 12000,
    category: "BEBE_MAMAN",
  },
  {
    title: "Lait Infantile Guigoz 1er Âge 400g",
    description:
      "Lait en poudre pour nourrissons de 0 à 6 mois, riche en nutriments essentiels.",
    prix: 5500,
    category: "BEBE_MAMAN",
  },
  {
    title: "Couches Pampers Baby-Dry Taille 3 (pack de 30)",
    description:
      "Couches ultra-absorbantes qui gardent bébé au sec toute la nuit.",
    prix: 7000,
    category: "BEBE_MAMAN",
  },
  {
    title: "Crème Bépanthène Bébé",
    description:
      "Crème protectrice pour prévenir et apaiser les irritations et rougeurs du siège.",
    prix: 3500,
    category: "BEBE_MAMAN",
  },
  {
    title: "Biberon Avent 260ml Anti-Colique",
    description:
      "Biberon ergonomique avec tétine anti-colique pour un confort d’allaitement optimal.",
    prix: 6000,
    category: "BEBE_MAMAN",
  },
  {
    title: "Sucette Philips Avent 0-6 mois",
    description: "Sucette orthodontique pour apaiser bébé en toute sécurité.",
    prix: 2000,
    category: "BEBE_MAMAN",
  },
  {
    title: "Thermomètre Bébé Digital",
    description:
      "Mesure rapide et précise de la température corporelle de bébé.",
    prix: 4500,
    category: "BEBE_MAMAN",
  },
  {
    title: "Gel Lavant Doux Bébé 250ml",
    description: "Nettoie la peau et les cheveux de bébé sans irriter.",
    prix: 3000,
    category: "BEBE_MAMAN",
  },
  {
    title: "Couverture Bébé en Coton 100x120cm",
    description: "Couverture douce et respirante pour le confort de bébé.",
    prix: 5000,
    category: "BEBE_MAMAN",
  },
  {
    title: "Chaussures Premiers Pas Bébé",
    description:
      "Chaussures légères et souples pour accompagner les premiers pas.",
    prix: 4500,
    category: "BEBE_MAMAN",
  },
  {
    title: "Siège Auto Groupe 0+ Bébé Confort",
    description: "Sécurité maximale pour bébé lors des trajets en voiture.",
    prix: 35000,
    category: "BEBE_MAMAN",
  },
  {
    title: "Body Manche Longue Coton Bio (lot de 3)",
    description:
      "Confortable et respirant, idéal pour la peau sensible de bébé.",
    prix: 8000,
    category: "BEBE_MAMAN",
  },
  {
    title: "Tapis d’Éveil Multicolore",
    description:
      "Stimule les sens de bébé avec des textures et couleurs variées.",
    prix: 9000,
    category: "BEBE_MAMAN",
  },
  {
    title: "Mouche Bébé Électrique",
    description:
      "Aide à dégager le nez de bébé facilement et en toute sécurité.",
    prix: 6500,
    category: "BEBE_MAMAN",
  },

  // --- SEXUALITE
  {
    title: "Préservatifs Durex Classic x12",
    description: "Protection fiable et confortable pour vos rapports.",
    prix: 3500,
    category: "SEXUALITE",
  },
  {
    title: "Préservatifs Durex Classic",
    description:
      "Préservatifs lubrifiés pour une protection fiable et un confort optimal.",
    prix: 1500,
    category: "SEXUALITE",
  },
  {
    title: "Gel Lubrifiant Intime KY Jelly",
    description:
      "Gel hydratant à base d’eau pour plus de confort pendant les rapports intimes.",
    prix: 4000,
    category: "SEXUALITE",
  },
  {
    title: "Test de Grossesse Clearblue",
    description:
      "Test rapide et fiable pour détecter une grossesse dès les premiers jours de retard.",
    prix: 2500,
    category: "SEXUALITE",
  },
  {
    title: "Complément Alimentaire Libido Homme",
    description:
      "Stimulant naturel pour améliorer la vitalité et les performances sexuelles masculines.",
    prix: 8500,
    category: "SEXUALITE",
  },
  {
    title: "Préservatifs Durex Extra Safe x12",
    description: "Pour une protection renforcée sans compromettre le confort.",
    prix: 4000,
    category: "SEXUALITE",
  },
  {
    title: "Préservatifs Durex Invisible x12",
    description: "Ultra fins pour une sensation naturelle tout en restant sûr.",
    prix: 4500,
    category: "SEXUALITE",
  },
  {
    title: "Gel Lubrifiant Intime Aloe Vera 100ml",
    description:
      "Lubrifiant doux et hydratant à base d’aloe vera pour plus de confort.",
    prix: 4200,
    category: "SEXUALITE",
  },
  {
    title: "Lubrifiant Intime Chauffant 50ml",
    description:
      "Procure une sensation de chaleur pour plus de plaisir intime.",
    prix: 5000,
    category: "SEXUALITE",
  },
  {
    title: "Anneau Vibrant pour Homme",
    description:
      "Améliore l’endurance et procure des sensations supplémentaires.",
    prix: 9000,
    category: "SEXUALITE",
  },
  {
    title: "Crème Retardante Masculine 20ml",
    description: "Aide à retarder l’éjaculation pour prolonger les rapports.",
    prix: 7500,
    category: "SEXUALITE",
  },
  {
    title: "Test de Fertilité Femmes",
    description:
      "Permet de détecter les périodes de fertilité pour planification familiale.",
    prix: 3000,
    category: "SEXUALITE",
  },
  {
    title: "Lubrifiant Intime Silicone 50ml",
    description:
      "Lubrifiant longue durée pour un confort optimal pendant les rapports.",
    prix: 4800,
    category: "SEXUALITE",
  },
  {
    title: "Préservatifs Aromatisés Durex x12",
    description:
      "Préservatifs avec différentes saveurs pour des rapports ludiques et sûrs.",
    prix: 5000,
    category: "SEXUALITE",
  },
  {
    title: "Complément Alimentaire Libido Femme",
    description:
      "Aide naturelle à stimuler la libido féminine et l’énergie sexuelle.",
    prix: 8800,
    category: "SEXUALITE",
  },

  // --- MATERIEL MEDICAL
  {
    title: "Tensiomètre Électronique Bras",
    description: "Mesure précise de la tension artérielle à domicile.",
    prix: 25000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Glucomètre Accu-Chek Guide",
    description:
      "Appareil de mesure de la glycémie précis et facile à utiliser pour le suivi du diabète.",
    prix: 25000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Thermomètre Infrarouge Sans Contact",
    description:
      "Permet de mesurer la température corporelle rapidement et sans contact, idéal pour bébés et adultes.",
    prix: 18000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Oxymètre de Pouls Digital",
    description:
      "Mesure la saturation en oxygène et le rythme cardiaque avec un affichage LED clair.",
    prix: 12000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Fauteuil Roulant Pliable",
    description:
      "Confortable et robuste, idéal pour les patients à mobilité réduite. Facile à transporter.",
    prix: 95000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Stéthoscope Littmann Classic III",
    description:
      "Stéthoscope professionnel pour écouter les sons cardiaques et pulmonaires avec précision.",
    prix: 60000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Pèse-personne Électronique Digital",
    description:
      "Balance précise pour mesurer le poids avec affichage digital facile à lire.",
    prix: 15000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Tensiomètre Poignet Automatique",
    description:
      "Mesure rapide et précise de la tension artérielle au poignet, pratique pour le domicile.",
    prix: 20000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Sonde Thermomètre Auriculaire",
    description:
      "Thermomètre pour mesurer rapidement la température via l’oreille, idéal pour enfants et adultes.",
    prix: 14000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Chariot Médical Multi-Usage",
    description:
      "Chariot pratique pour transporter du matériel médical dans les cliniques et hôpitaux.",
    prix: 75000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Canne de Marche Ajustable",
    description:
      "Canne légère et réglable pour aider à la mobilité des patients.",
    prix: 12000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Matelas Anti-Escarre Médical",
    description:
      "Matelas spécialement conçu pour prévenir les escarres chez les patients alités.",
    prix: 95000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Gants Médicaux Jetables (Boîte de 100)",
    description:
      "Gants stériles pour examens médicaux et interventions, protection optimale.",
    prix: 15000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Seringues Jetables 5ml (Boîte de 50)",
    description: "Seringues stériles pour injections et prélèvements médicaux.",
    prix: 12000,
    category: "MATERIEL_MEDICAL",
  },
  {
    title: "Masques Chirurgicaux (Boîte de 50)",
    description:
      "Masques jetables pour protéger contre les infections et la propagation des germes.",
    prix: 8000,
    category: "MATERIEL_MEDICAL",
  },

  // --- BIEN-ETRE / DÉTENTE
  {
    title: "Crème Hydratante Visage 50ml",
    description: "Hydrate intensément la peau sèche du visage.",
    prix: 6000,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Gel Douche Relaxant Lavande 250ml",
    description:
      "Nettoie et hydrate la peau tout en apportant une sensation de détente.",
    prix: 3000,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Lotion Hydratante Corps 200ml",
    description:
      "Hydrate et adoucit la peau en profondeur pour un toucher soyeux.",
    prix: 4500,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Savon Naturel au Karité 100g",
    description: "Nourrit et protège la peau grâce à ses ingrédients naturels.",
    prix: 1500,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Bougie Aromathérapie Relax 200g",
    description:
      "Diffuse un parfum apaisant pour créer une ambiance relaxante.",
    prix: 4000,
    category: "BIEN_ETRE_DETENTE",
  },
  {
    title: "Roll-on Menthe Poivrée 10ml",
    description: "Apaise les tensions musculaires et stimule la circulation.",
    prix: 3500,
    category: "BIEN_ETRE_DETENTE",
  },
  {
    title: "Huile de Massage Argan 100ml",
    description:
      "Hydrate la peau et détend les muscles après une journée stressante.",
    prix: 6000,
    category: "BIEN_ETRE_DETENTE",
  },
  {
    title: "Spray Ambiance Lavande 100ml",
    description: "Purifie et parfume l’air pour une atmosphère relaxante.",
    prix: 2500,
    category: "BIEN_ETRE_DETENTE",
  },

  {
    title: "Coussin Chauffant Cervical",
    description:
      "Soulage les tensions au niveau du cou et des épaules avec chaleur douce.",
    prix: 18000,
    category: "BIEN_ETRE_DETENTE",
  },
  {
    title: "Exfoliant Corps Sucre & Coco 200g",
    description:
      "Élimine les cellules mortes et laisse la peau douce et lumineuse.",
    prix: 5000,
    category: "BEAUTE_HYGIENE",
  },
  {
    title: "Spray Relaxant Pour Oreiller 50ml",
    description:
      "Favorise l’endormissement grâce aux huiles essentielles apaisantes.",
    prix: 3000,
    category: "BIEN_ETRE_DETENTE",
  },

  {
    title: "Baume du Tigre Rouge 19g",
    description: "Soulage les douleurs musculaires et articulaires.",
    prix: 3000,
    category: "BIEN_ETRE_DETENTE",
  },
  {
    title: "Huile Essentielle d’Eucalyptus 10ml",
    description:
      "Favorise la respiration et détend grâce à ses propriétés purifiantes et apaisantes.",
    prix: 3500,
    category: "BIEN_ETRE_DETENTE",
  },
  {
    title: "Tisane Relaxante Nuit Calme 20 sachets",
    description:
      "Infusion naturelle à base de camomille et verveine pour faciliter le sommeil et réduire le stress.",
    prix: 2500,
    category: "BIEN_ETRE_DETENTE",
  },
  {
    title: "Crème Chauffante Musculaire 100g",
    description:
      "Détend les muscles après l’effort et soulage les douleurs articulaires.",
    prix: 4000,
    category: "BIEN_ETRE_DETENTE",
  },
  {
    title: "Bandeau de Relaxation Chauffant",
    description:
      "Soulage les maux de tête et les tensions oculaires grâce à une douce chaleur relaxante.",
    prix: 15000,
    category: "BIEN_ETRE_DETENTE",
  },

  // --- ORL
  {
    title: "Gouttes Nasales Physiologiques",
    description: "Nettoyage nasal quotidien, adaptées aux enfants.",
    prix: 2000,
    category: "ORL",
  },
  {
    title: "Spray Nasal Physiomer 135ml",
    description:
      "Solution d’eau de mer naturelle pour dégager le nez bouché et prévenir les infections ORL.",
    prix: 4500,
    category: "ORL",
  },
  {
    title: "Sirop Toplexil 150ml",
    description:
      "Traitement contre la toux sèche et les irritations de la gorge. Effet apaisant rapide.",
    prix: 3500,
    category: "ORL",
  },
  {
    title: "Pastilles Strepsils Miel Citron x24",
    description:
      "Soulage efficacement les maux de gorge et les irritations grâce à son action antiseptique.",
    prix: 3000,
    category: "ORL",
  },
  {
    title: "Gouttes Auriculaires Otalgan 10ml",
    description:
      "Soulage les douleurs et inflammations de l’oreille. Idéal en cas d’otite légère.",
    prix: 4000,
    category: "ORL",
  },
  {
    title: "Spray Nasal Otrivin 10ml",
    description:
      "Décongestionne rapidement le nez en cas de rhume ou allergie.",
    prix: 3500,
    category: "ORL",
  },
  {
    title: "Sirop Bronchokid 125ml",
    description: "Apaise la toux et facilite la respiration chez l’enfant.",
    prix: 4000,
    category: "ORL",
  },
  {
    title: "Pastilles Vicks Miel Menthe x20",
    description: "Soulage les maux de gorge et les irritations rapidement.",
    prix: 2800,
    category: "ORL",
  },
  {
    title: "Gouttes Nasales Bébé Physiologiques 20ml",
    description: "Nettoyage nasal doux pour les nourrissons et jeunes enfants.",
    prix: 1800,
    category: "ORL",
  },
  {
    title: "Spray Nasal Adultes Sterimar 100ml",
    description:
      "Purifie et humidifie les voies nasales, idéal pour usage quotidien.",
    prix: 5000,
    category: "ORL",
  },
  {
    title: "Sirop Toux Grasse Vicks 150ml",
    description: "Facilite l’expectoration et soulage la toux persistante.",
    prix: 3800,
    category: "ORL",
  },
  {
    title: "Pastilles Propolis x24",
    description:
      "Aide à apaiser les irritations de la gorge et renforce les défenses naturelles.",
    prix: 3200,
    category: "ORL",
  },
  {
    title: "Spray Auriculaire Audispray 10ml",
    description: "Dissout le cérumen et nettoie les oreilles en douceur.",
    prix: 4000,
    category: "ORL",
  },
  {
    title: "Gouttes Anti-Allergie Nasales 10ml",
    description:
      "Réduit les symptômes de rhinite allergique et congestion nasale.",
    prix: 4500,
    category: "ORL",
  },
  {
    title: "Inhalateur Ultrasonique Aromathérapie",
    description:
      "Favorise la respiration et apaise les voies respiratoires avec huiles essentielles.",
    prix: 15000,
    category: "ORL",
  },
];
