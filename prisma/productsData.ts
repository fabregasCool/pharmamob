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
    title: "Panadol (Paracétamol)",
    description: "Antalgiques — boîte de comprimés paracétamol",
    prix: 900,
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
    title: "Tramadol (Tramadol 50mg)",
    description: "Antalgique opioïde — prescription requise",
    prix: 1500,
    category: "MEDICAMENT",
  },
  {
    title: "Tramadol (Tramal/Tramazigen variant)",
    description: "Autres marques de tramadol — antidouleur puissant",
    prix: 1500,
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
  {
    title: "Doxycycline",
    description: "Tétracycline — infections respiratoires, certaines MST",
    prix: 1400,
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

  // --- BIEN-ETRE / DÉTENTE
  {
    title: "Crème Hydratante Visage 50ml",
    description: "Hydrate intensément la peau sèche du visage.",
    prix: 6000,
    category: "BEAUTE_HYGIENE",
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
];
