import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Initialisation des catégories de base...')

  // Catégories principales pour une marketplace générale
  const categories = [
    // SERVICES
    {
      name: 'Services',
      slug: 'services',
      description: 'Tous types de services et prestations',
      icon: '🔧',
      children: [
        {
          name: 'Éducation & Formation',
          slug: 'education-formation',
          description: 'Cours, formations, tutorat',
          icon: '🎓'
        },
        {
          name: 'Services Techniques',
          slug: 'services-techniques',
          description: 'Réparation, dépannage, maintenance',
          icon: '🔨'
        },
        {
          name: 'Services Domestiques',
          slug: 'services-domestiques',
          description: 'Ménage, jardinage, garde',
          icon: '🏠'
        },
        {
          name: 'Transport & Livraison',
          slug: 'transport-livraison',
          description: 'Transport de personnes et biens',
          icon: '🚚'
        },
        {
          name: 'Services Professionnels',
          slug: 'services-professionnels',
          description: 'Consulting, comptabilité, juridique',
          icon: '💼'
        },
        {
          name: 'Santé & Bien-être',
          slug: 'sante-bien-etre-services',
          description: 'Services de santé, beauté et bien-être',
          icon: '💊'
        },
        {
          name: 'Événements & Divertissement',
          slug: 'evenements-divertissement',
          description: 'Organisation d\'événements, animation',
          icon: '🎉'
        }
      ]
    },
    // PRODUITS
    {
      name: 'Produits',
      slug: 'produits',
      description: 'Tous types de produits et articles',
      icon: '📦',
      children: [
        {
          name: 'Électronique & Informatique',
          slug: 'electronique-informatique',
          description: 'Téléphones, ordinateurs, gadgets',
          icon: '💻'
        },
        {
          name: 'Véhicules & Transport',
          slug: 'vehicules-transport',
          description: 'Voitures, motos, vélos',
          icon: '🚗'
        },
        {
          name: 'Immobilier',
          slug: 'immobilier',
          description: 'Maisons, appartements, terrains',
          icon: '🏢'
        },
        {
          name: 'Mobilier & Décoration',
          slug: 'mobilier-decoration',
          description: 'Meubles et décoration intérieure',
          icon: '🛋️'
        },
        {
          name: 'Mode & Accessoires',
          slug: 'mode-accessoires',
          description: 'Vêtements, chaussures, bijoux',
          icon: '👗'
        },
        {
          name: 'Alimentation & Boissons',
          slug: 'alimentation-boissons',
          description: 'Produits alimentaires et boissons',
          icon: '🍽️'
        },
        {
          name: 'Sports & Loisirs',
          slug: 'sports-loisirs',
          description: 'Équipements sportifs et loisirs',
          icon: '⚽'
        },
        {
          name: 'Livres & Papeterie',
          slug: 'livres-papeterie',
          description: 'Livres, fournitures scolaires',
          icon: '📚'
        },
        {
          name: 'Santé & Beauté',
          slug: 'sante-beaute-produits',
          description: 'Produits de santé et cosmétiques',
          icon: '💄'
        }
      ]
    },
    // EMPLOI
    {
      name: 'Emploi & Recrutement',
      slug: 'emploi-recrutement',
      description: 'Offres d\'emploi et recherche de talents',
      icon: '💼',
      children: [
        {
          name: 'Offres d\'emploi',
          slug: 'offres-emploi',
          description: 'Postes à pourvoir',
          icon: '📋'
        },
        {
          name: 'Recherche d\'emploi',
          slug: 'recherche-emploi',
          description: 'CV et candidatures',
          icon: '📄'
        },
        {
          name: 'Freelance',
          slug: 'freelance',
          description: 'Missions freelance',
          icon: '💻'
        },
        {
          name: 'Stages',
          slug: 'stages',
          description: 'Offres de stages',
          icon: '🎓'
        }
      ]
    },
    // AUTRES
    {
      name: 'Autres',
      slug: 'autres',
      description: 'Autres catégories',
      icon: '📌',
      children: [
        {
          name: 'Animaux',
          slug: 'animaux',
          description: 'Animaux et accessoires',
          icon: '🐾'
        },
        {
          name: 'Dons & Échanges',
          slug: 'dons-echanges',
          description: 'Dons gratuits et échanges',
          icon: '🤝'
        },
        {
          name: 'Communauté',
          slug: 'communaute',
          description: 'Annonces communautaires',
          icon: '👥'
        }
      ]
    }
  ]

  // Créer les catégories avec leurs sous-catégories
  for (const categoryData of categories) {
    const { children, ...parentData } = categoryData

    // Vérifier si la catégorie parente existe déjà
    const existingParent = await prisma.category.findUnique({
      where: { slug: parentData.slug }
    })

    let parent
    if (existingParent) {
      console.log(`✅ Catégorie "${parentData.name}" existe déjà`)
      parent = existingParent
    } else {
      // Créer la catégorie parente
      parent = await prisma.category.create({
        data: parentData
      })
      console.log(`✅ Catégorie créée: ${parent.name}`)
    }

    // Créer les sous-catégories
    if (children && children.length > 0) {
      for (const childData of children) {
        const existingChild = await prisma.category.findUnique({
          where: { slug: childData.slug }
        })

        if (existingChild) {
          console.log(`  ✅ Sous-catégorie "${childData.name}" existe déjà`)
        } else {
          const child = await prisma.category.create({
            data: {
              ...childData,
              parentId: parent.id
            }
          })
          console.log(`  ✅ Sous-catégorie créée: ${child.name}`)
        }
      }
    }
  }

  console.log('🎉 Initialisation des catégories terminée!')

  // Afficher le nombre total de catégories
  const totalCategories = await prisma.category.count()
  console.log(`📊 Total: ${totalCategories} catégories dans la base de données`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erreur:', e)
    await prisma.$disconnect()
    process.exit(1)
  })