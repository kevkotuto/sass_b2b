import { PrismaClient, Gender, VerificationStatus, DocumentType, Currency, ListingType, ListingStatus, MessageType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Démarrage du seed...')

  // Nettoyer les données existantes
  console.log('🧹 Nettoyage des données existantes...')
  await prisma.verificationRequest.deleteMany()
  await prisma.review.deleteMany()
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()

  // 1. Créer les catégories
  console.log('📂 Création des catégories...')
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Services à domicile',
        slug: 'services-domicile',
        description: 'Plomberie, électricité, ménage, jardinage',
        icon: '🏠'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Éducation & Formation',
        slug: 'education-formation',
        description: 'Cours particuliers, formations, coaching',
        icon: '📚'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Informatique & Tech',
        slug: 'informatique-tech',
        description: 'Développement, réparation, formation IT',
        icon: '💻'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Beauté & Bien-être',
        slug: 'beaute-bien-etre',
        description: 'Coiffure, massage, esthétique',
        icon: '💄'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Transport & Livraison',
        slug: 'transport-livraison',
        description: 'Taxi, déménagement, livraison',
        icon: '🚗'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Électronique',
        slug: 'electronique',
        description: 'Téléphones, ordinateurs, TV',
        icon: '📱'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Mode & Vêtements',
        slug: 'mode-vetements',
        description: 'Vêtements, chaussures, accessoires',
        icon: '👕'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Immobilier',
        slug: 'immobilier',
        description: 'Location, vente, colocation',
        icon: '🏡'
      }
    })
  ])

  // 2. Créer l'admin par défaut
  console.log('👑 Création de l\'administrateur...')
  const hashedAdminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      phone: '+221770000000',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'Agora',
      age: 30,
      gender: Gender.MALE,
      isAdmin: true,
      verified: true,
      verificationStatus: VerificationStatus.APPROVED,
      score: 100.0,
      totalRating: 5.0,
      ratingCount: 20
    }
  })

  // 3. Créer des utilisateurs de test (Dakar et Abidjan)
  console.log('👥 Création des utilisateurs de test...')
  const usersData = [
    // Utilisateurs Dakar
    {
      phone: '+221771234567',
      password: 'password123',
      firstName: 'Fatou',
      lastName: 'Diallo',
      age: 28,
      gender: Gender.FEMALE,
      verified: true,
      verificationStatus: VerificationStatus.APPROVED,
      score: 4.8,
      address: '15 Avenue Léopold Sédar Senghor, Plateau',
      city: 'Dakar',
      country: 'Sénégal',
      latitude: 14.6937,
      longitude: -17.4441
    },
    {
      phone: '+221772345678',
      password: 'password123',
      firstName: 'Mamadou',
      lastName: 'Ba',
      age: 35,
      gender: Gender.MALE,
      verified: true,
      verificationStatus: VerificationStatus.APPROVED,
      score: 4.5,
      address: '45 Rue de Ngor, Almadies',
      city: 'Dakar',
      country: 'Sénégal',
      latitude: 14.7392,
      longitude: -17.5297
    },
    {
      phone: '+221773456789',
      password: 'password123',
      firstName: 'Aminata',
      lastName: 'Sow',
      age: 25,
      gender: Gender.FEMALE,
      verified: false,
      verificationStatus: VerificationStatus.PENDING,
      score: 4.2,
      address: '78 Boulevard Dial Diop, Mermoz',
      city: 'Dakar',
      country: 'Sénégal',
      latitude: 14.7169,
      longitude: -17.4679
    },
    // Nouveaux utilisateurs Abidjan - Treichville
    {
      phone: '+2250701234567',
      password: 'password123',
      firstName: 'Awa',
      lastName: 'Traoré',
      age: 29,
      gender: Gender.FEMALE,
      verified: true,
      verificationStatus: VerificationStatus.APPROVED,
      score: 4.7,
      address: 'Boulevard de Marseille, Treichville',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      latitude: 5.2469,
      longitude: -4.0232
    },
    {
      phone: '+2250702345678',
      password: 'password123',
      firstName: 'Kouassi',
      lastName: 'Kouamé',
      age: 33,
      gender: Gender.MALE,
      verified: true,
      verificationStatus: VerificationStatus.APPROVED,
      score: 4.6,
      address: 'Rue 12, Quartier Biafra, Treichville',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      latitude: 5.2501,
      longitude: -4.0198
    },
    {
      phone: '+2250703456789',
      password: 'password123',
      firstName: 'Mariama',
      lastName: 'Diabaté',
      age: 26,
      gender: Gender.FEMALE,
      verified: true,
      verificationStatus: VerificationStatus.APPROVED,
      score: 4.9,
      address: 'Avenue 7, Résidentiel, Treichville',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      latitude: 5.2445,
      longitude: -4.0165
    },
    {
      phone: '+2250704567890',
      password: 'password123',
      firstName: 'Ibrahim',
      lastName: 'Ouattara',
      age: 38,
      gender: Gender.MALE,
      verified: true,
      verificationStatus: VerificationStatus.APPROVED,
      score: 4.4,
      address: 'Carrefour Biafra, Treichville',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      latitude: 5.2533,
      longitude: -4.0211
    },
    {
      phone: '+2250705678901',
      password: 'password123',
      firstName: 'Fatoumata',
      lastName: 'Sanogo',
      age: 31,
      gender: Gender.FEMALE,
      verified: false,
      verificationStatus: VerificationStatus.PENDING,
      score: 4.2,
      address: 'Rue du Commerce, Treichville',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      latitude: 5.2478,
      longitude: -4.0187
    },
    {
      phone: '+2250706789012',
      password: 'password123',
      firstName: 'Seydou',
      lastName: 'Doumbia',
      age: 27,
      gender: Gender.MALE,
      verified: true,
      verificationStatus: VerificationStatus.APPROVED,
      score: 4.8,
      address: 'Boulevard Nangui Abrogoua, Treichville',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      latitude: 5.2455,
      longitude: -4.0143
    }
  ]

  const users = await Promise.all(
    usersData.map(async (userData) => {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      return prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          totalRating: userData.score,
          ratingCount: Math.floor(Math.random() * 10) + 5
        }
      })
    })
  )

  // 4. Créer des demandes de vérification
  console.log('📄 Création des demandes de vérification...')
  const verificationRequests = await Promise.all([
    // Demande soumise (en attente)
    prisma.verificationRequest.create({
      data: {
        userId: users[4].id, // Aïcha
        documentType: DocumentType.NATIONAL_ID,
        documentUrl: '/uploads/verification/mock_id_card.jpg',
        documentName: 'carte_identite.jpg',
        status: VerificationStatus.SUBMITTED,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
      }
    }),
    // Demande approuvée
    prisma.verificationRequest.create({
      data: {
        userId: users[0].id, // Fatou
        documentType: DocumentType.PASSPORT,
        documentUrl: '/uploads/verification/mock_passport.jpg',
        documentName: 'passeport.jpg',
        status: VerificationStatus.APPROVED,
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
        reviewedById: admin.id,
        adminNotes: 'Document clair et valide',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Android 12; Mobile)'
      }
    })
  ])

  // 5. Créer des annonces de services
  console.log('📋 Création des annonces...')
  const listingsData = [
    {
      title: 'Plombier professionnel - Réparations et installations',
      description: 'Plombier expérimenté avec 10 ans d\'expérience. Réparation de fuites, installation de sanitaires, débouchage de canalisations. Disponible 7j/7 pour les urgences. Devis gratuit.',
      price: 15000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['plomberie', 'réparation', 'urgence', 'sanitaire', 'fuite'],
      location: 'Dakar, Plateau',
      address: '15 Avenue Léopold Sédar Senghor, Plateau',
      city: 'Dakar',
      latitude: 14.6937,
      longitude: -17.4441,
      contact: '+221771234567',
      userId: users[0].id,
      categoryId: categories[0].id
    },
    {
      title: 'Cours particuliers de mathématiques - Collège et Lycée',
      description: 'Professeur de mathématiques certifié propose cours particuliers pour élèves de collège et lycée. Préparation aux examens, aide aux devoirs, remise à niveau. Résultats garantis.',
      price: 8000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['mathématiques', 'cours', 'professeur', 'soutien scolaire', 'examens'],
      location: 'Dakar, Almadies',
      address: '45 Rue de Ngor, Almadies',
      city: 'Dakar',
      latitude: 14.7392,
      longitude: -17.5297,
      contact: '+221772345678',
      userId: users[1].id,
      categoryId: categories[1].id
    },
    {
      title: 'Développement d\'applications web et mobile',
      description: 'Développeur full-stack spécialisé en React, Node.js et React Native. Création de sites web, applications mobiles et e-commerce. Portfolio disponible sur demande.',
      price: 250000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['développement', 'web', 'mobile', 'react', 'nodejs', 'application'],
      location: 'Dakar, Mermoz',
      address: '78 Boulevard Dial Diop, Mermoz',
      city: 'Dakar',
      latitude: 14.7169,
      longitude: -17.4679,
      contact: '+221773456789',
      userId: users[2].id,
      categoryId: categories[2].id
    },
    {
      title: 'Coiffure à domicile - Femmes et enfants',
      description: 'Coiffeuse professionnelle se déplace à domicile. Spécialisée en coiffures africaines, défrisage, tresses, soins capillaires. Produits de qualité fournis.',
      price: 12000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['coiffure', 'domicile', 'femmes', 'enfants', 'tresses', 'défrisage'],
      location: 'Dakar, Parcelles Assainies',
      address: '23 Avenue Cheikh Anta Diop, Parcelles Assainies',
      city: 'Dakar',
      latitude: 14.7644,
      longitude: -17.4167,
      contact: '+221774567890',
      userId: users[3].id,
      categoryId: categories[3].id
    },
    {
      title: 'Service de livraison rapide - Dakar et banlieue',
      description: 'Livraison rapide et sécurisée dans tout Dakar. Colis, courses, documents. Moto et voiture disponibles. Tarifs compétitifs, service 24h/24.',
      price: 3000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['livraison', 'transport', 'rapide', 'moto', 'colis', '24h'],
      location: 'Dakar, Grand Dakar',
      address: '12 Rue de Grand Dakar',
      city: 'Dakar',
      latitude: 14.6928,
      longitude: -17.4467,
      contact: '+221775678901',
      userId: users[4].id,
      categoryId: categories[4].id
    },
    {
      title: 'iPhone 13 Pro Max 256GB - État neuf',
      description: 'iPhone 13 Pro Max 256GB couleur bleu sierra. Acheté il y a 6 mois, très peu utilisé. Boîte d\'origine, chargeur, écouteurs inclus. Aucune rayure.',
      price: 650000,
      currency: Currency.CFA,
      type: ListingType.PRODUCT,
      tags: ['iphone', 'apple', 'smartphone', 'neuf', '256gb', 'pro max'],
      location: 'Dakar, Point E',
      address: '67 Avenue Cheikh Anta Diop, Point E',
      city: 'Dakar',
      latitude: 14.7058,
      longitude: -17.4647,
      contact: '+221771234567',
      userId: users[0].id,
      categoryId: categories[5].id
    },
    {
      title: 'MacBook Air M1 - Parfait état',
      description: 'MacBook Air avec puce M1, 8GB RAM, 256GB SSD. Acheté en 2022, parfait état. Idéal pour étudiants et professionnels. Chargeur d\'origine inclus.',
      price: 850000,
      currency: Currency.CFA,
      type: ListingType.PRODUCT,
      tags: ['macbook', 'apple', 'ordinateur', 'm1', 'portable', 'étudiant'],
      location: 'Dakar, Sacré-Cœur',
      address: '89 Boulevard du Général de Gaulle, Sacré-Cœur',
      city: 'Dakar',
      latitude: 14.7203,
      longitude: -17.4672,
      contact: '+221772345678',
      userId: users[1].id,
      categoryId: categories[5].id
    },
    {
      title: 'Robe de soirée élégante - Taille M',
      description: 'Magnifique robe de soirée couleur bordeaux, taille M. Portée une seule fois pour un mariage. Parfait état, très élégante. Photos disponibles.',
      price: 45000,
      currency: Currency.CFA,
      type: ListingType.PRODUCT,
      tags: ['robe', 'soirée', 'élégante', 'bordeaux', 'mariage', 'taille m'],
      location: 'Dakar, Fann',
      address: '34 Rue de Fann Résidence, Fann',
      city: 'Dakar',
      latitude: 14.6890,
      longitude: -17.4692,
      contact: '+221773456789',
      userId: users[2].id,
      categoryId: categories[6].id
    },
    // ===== ANNONCES ABIDJAN - TREICHVILLE =====
    {
      title: 'Mécanicien automobile - Réparation tous véhicules',
      description: 'Garage spécialisé dans la réparation de tous types de véhicules. Diagnostic électronique, vidange, freins, embrayage. 15 ans d\'expérience. Pièces détachées disponibles.',
      price: 25000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['mécanique', 'automobile', 'réparation', 'garage', 'véhicule', 'diagnostic'],
      location: 'Abidjan, Treichville',
      address: 'Boulevard de Marseille, Treichville',
      city: 'Abidjan',
      latitude: 5.2469,
      longitude: -4.0232,
      contact: '+2250701234567',
      userId: users[3].id,
      categoryId: categories[0].id
    },
    {
      title: 'Cours de français et anglais - Tous niveaux',
      description: 'Professeure certifiée propose cours de français et anglais pour tous niveaux. Préparation aux examens officiels, conversation, grammaire. Méthode interactive.',
      price: 10000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['français', 'anglais', 'cours', 'langue', 'professeur', 'examens'],
      location: 'Abidjan, Treichville',
      address: 'Rue 12, Quartier Biafra, Treichville',
      city: 'Abidjan',
      latitude: 5.2501,
      longitude: -4.0198,
      contact: '+2250702345678',
      userId: users[4].id,
      categoryId: categories[1].id
    },
    {
      title: 'Création de sites web et e-commerce',
      description: 'Développeuse web spécialisée en création de sites vitrines et boutiques en ligne. WordPress, Shopify, développement sur mesure. Portfolio de 50+ projets.',
      price: 180000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['web', 'site internet', 'e-commerce', 'wordpress', 'shopify', 'développement'],
      location: 'Abidjan, Treichville',
      address: 'Avenue 7, Résidentiel, Treichville',
      city: 'Abidjan',
      latitude: 5.2445,
      longitude: -4.0165,
      contact: '+2250703456789',
      userId: users[5].id,
      categoryId: categories[2].id
    },
    {
      title: 'Salon de beauté - Soins complets pour femmes',
      description: 'Salon moderne proposant coiffure, manucure, pédicure, soins du visage. Spécialiste en coiffures africaines traditionnelles et modernes. Produits de qualité.',
      price: 15000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['beauté', 'salon', 'coiffure', 'manucure', 'soins', 'femmes'],
      location: 'Abidjan, Treichville',
      address: 'Carrefour Biafra, Treichville',
      city: 'Abidjan',
      latitude: 5.2533,
      longitude: -4.0211,
      contact: '+2250704567890',
      userId: users[6].id,
      categoryId: categories[3].id
    },
    {
      title: 'Moto-taxi et livraison express Abidjan',
      description: 'Service de transport rapide en moto dans tout Abidjan. Livraison express, courses urgentes, transport de personnes. Disponible 24h/24, tarifs abordables.',
      price: 2000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['moto-taxi', 'transport', 'livraison', 'rapide', 'abidjan', '24h'],
      location: 'Abidjan, Treichville',
      address: 'Rue du Commerce, Treichville',
      city: 'Abidjan',
      latitude: 5.2478,
      longitude: -4.0187,
      contact: '+2250705678901',
      userId: users[7].id,
      categoryId: categories[4].id
    },
    {
      title: 'Samsung Galaxy S23 Ultra - Neuf sous garantie',
      description: 'Samsung Galaxy S23 Ultra 256GB, couleur noir fantôme. Téléphone neuf jamais utilisé, encore sous garantie constructeur. Tous accessoires inclus.',
      price: 580000,
      currency: Currency.CFA,
      type: ListingType.PRODUCT,
      tags: ['samsung', 'galaxy', 's23', 'ultra', 'smartphone', 'neuf'],
      location: 'Abidjan, Treichville',
      address: 'Boulevard Nangui Abrogoua, Treichville',
      city: 'Abidjan',
      latitude: 5.2455,
      longitude: -4.0143,
      contact: '+2250706789012',
      userId: users[8].id,
      categoryId: categories[5].id
    },
    {
      title: 'Ordinateur portable HP - Pour étudiants',
      description: 'HP Pavilion 15, Intel Core i5, 8GB RAM, 512GB SSD. Parfait pour les études et travail de bureau. Écran 15.6 pouces, autonomie 8h. Prix étudiant.',
      price: 420000,
      currency: Currency.CFA,
      type: ListingType.PRODUCT,
      tags: ['hp', 'ordinateur', 'portable', 'étudiant', 'core i5', 'ssd'],
      location: 'Abidjan, Treichville',
      address: 'Avenue 7, Résidentiel, Treichville',
      city: 'Abidjan',
      latitude: 5.2445,
      longitude: -4.0165,
      contact: '+2250703456789',
      userId: users[5].id,
      categoryId: categories[5].id
    },
    {
      title: 'Vêtements traditionnels ivoiriens - Sur mesure',
      description: 'Confection de vêtements traditionnels ivoiriens : boubous, complets, robes kaba. Tissus wax de qualité, broderies artisanales. Livraison en 1 semaine.',
      price: 85000,
      currency: Currency.CFA,
      type: ListingType.PRODUCT,
      tags: ['vêtements', 'traditionnel', 'ivoirien', 'boubou', 'wax', 'sur mesure'],
      location: 'Abidjan, Treichville',
      address: 'Rue du Commerce, Treichville',
      city: 'Abidjan',
      latitude: 5.2478,
      longitude: -4.0187,
      contact: '+2250705678901',
      userId: users[7].id,
      categoryId: categories[6].id
    },
    {
      title: 'Appartement 2 pièces à louer - Résidentiel',
      description: 'Bel appartement de 2 pièces dans quartier résidentiel calme. Cuisine équipée, salle de bain moderne, balcon. Proche des transports et commerces.',
      price: 120000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['appartement', 'location', '2 pièces', 'résidentiel', 'équipé', 'treichville'],
      location: 'Abidjan, Treichville',
      address: 'Carrefour Biafra, Treichville',
      city: 'Abidjan',
      latitude: 5.2533,
      longitude: -4.0211,
      contact: '+2250704567890',
      userId: users[6].id,
      categoryId: categories[7].id
    },
    {
      title: 'Cours de conduite auto et moto',
      description: 'Auto-école agréée propose cours de conduite automobile et moto. Moniteurs expérimentés, véhicules récents, taux de réussite 95%. Forfaits avantageux.',
      price: 75000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['auto-école', 'conduite', 'permis', 'automobile', 'moto', 'moniteur'],
      location: 'Abidjan, Treichville',
      address: 'Boulevard de Marseille, Treichville',
      city: 'Abidjan',
      latitude: 5.2469,
      longitude: -4.0232,
      contact: '+2250701234567',
      userId: users[3].id,
      categoryId: categories[1].id
    },
    {
      title: 'Électricien professionnel - Dépannage 24h/24',
      description: 'Électricien certifié pour tous travaux électriques : installation, réparation, dépannage urgent. Respect des normes de sécurité. Devis gratuit.',
      price: 20000,
      currency: Currency.CFA,
      type: ListingType.SERVICE,
      tags: ['électricien', 'électricité', 'dépannage', 'installation', 'urgence', '24h'],
      location: 'Abidjan, Treichville',
      address: 'Rue 12, Quartier Biafra, Treichville',
      city: 'Abidjan',
      latitude: 5.2501,
      longitude: -4.0198,
      contact: '+2250702345678',
      userId: users[4].id,
      categoryId: categories[0].id
    },
    {
      title: 'Télévision Samsung 55 pouces 4K Smart TV',
      description: 'Smart TV Samsung 55 pouces, résolution 4K UHD, HDR, WiFi intégré. État impeccable, achetée il y a 8 mois. Télécommande et câbles inclus.',
      price: 380000,
      currency: Currency.CFA,
      type: ListingType.PRODUCT,
      tags: ['télévision', 'samsung', '55 pouces', '4k', 'smart tv', 'hdr'],
      location: 'Abidjan, Treichville',
      address: 'Boulevard Nangui Abrogoua, Treichville',
      city: 'Abidjan',
      latitude: 5.2455,
      longitude: -4.0143,
      contact: '+2250706789012',
      userId: users[8].id,
      categoryId: categories[5].id
    }
  ]

  const listings = await Promise.all(
    listingsData.map((listingData) =>
      prisma.listing.create({
        data: {
          ...listingData,
          status: ListingStatus.ACTIVE
        }
      })
    )
  )

  // 6. Créer quelques avis
  console.log('⭐ Création des avis...')
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Excellent travail ! Le plombier est arrivé à l\'heure et a réparé ma fuite rapidement. Je recommande vivement.',
        authorId: users[1].id,
        targetId: users[0].id,
        listingId: listings[0].id
      }
    }),
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Professeur très pédagogue. Mon fils a progressé énormément en mathématiques grâce à ses cours.',
        authorId: users[2].id,
        targetId: users[1].id,
        listingId: listings[1].id
      }
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Application développée selon mes attentes. Quelques petits ajustements nécessaires mais bon travail.',
        authorId: users[3].id,
        targetId: users[2].id,
        listingId: listings[2].id
      }
    })
  ])

  // 7. Créer quelques conversations et messages
  console.log('💬 Création des conversations...')
  const conversation = await prisma.conversation.create({
    data: {
      userId: users[1].id,
      listingId: listings[0].id,
      lastMessageAt: new Date()
    }
  })

  const messages = await Promise.all([
    prisma.message.create({
      data: {
        content: 'Bonjour, je suis intéressé par vos services de plomberie. Pourriez-vous passer demain ?',
        senderId: users[1].id,
        receiverId: users[0].id,
        conversationId: conversation.id,
        type: MessageType.TEXT,
        read: true
      }
    }),
    prisma.message.create({
      data: {
        content: 'Bonjour ! Oui, je peux passer demain matin. Quel est le problème exactement ?',
        senderId: users[0].id,
        receiverId: users[1].id,
        conversationId: conversation.id,
        type: MessageType.TEXT,
        read: false
      }
    })
  ])

  console.log('✅ Seed terminé avec succès !')
  console.log(`
📊 Données créées :
- ${categories.length} catégories
- ${users.length + 1} utilisateurs (+ 1 admin)
- ${verificationRequests.length} demandes de vérification
- ${listings.length} annonces
- ${reviews.length} avis
- ${messages.length} messages

👑 Compte administrateur :
- Téléphone : +221770000000
- Mot de passe : admin123

👥 Comptes utilisateurs :
${users.map(user => `- ${user.firstName} ${user.lastName} : ${user.phone} / password123`).join('\n')}
  `)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })