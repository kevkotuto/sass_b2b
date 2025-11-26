import { Client } from "@elastic/elasticsearch"

// Configuration du client Elasticsearch
export const elasticsearchClient = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME!,
    password: process.env.ELASTICSEARCH_PASSWORD!,
  },
  tls: {
    rejectUnauthorized: false // Pour les certificats auto-signés
  }
})

// Mapping optimisé pour les annonces de la marketplace
export const listingMapping = {
  properties: {
    title: {
      type: "text",
      analyzer: "french",
      fields: {
        keyword: { type: "keyword" },
        suggest: {
          type: "completion",
          analyzer: "simple"
        }
      }
    },
    description: {
      type: "text",
      analyzer: "french"
    },
    tags: {
      type: "text",
      analyzer: "keyword",
      fields: {
        suggest: { type: "completion" }
      }
    },
    price: {
      type: "float"
    },
    currency: {
      type: "keyword"
    },
    type: {
      type: "keyword" // "SERVICE" ou "PRODUCT"
    },
    status: {
      type: "keyword" // "ACTIVE", "INACTIVE", etc.
    },
    location: {
      type: "text",
      analyzer: "french",
      fields: {
        keyword: { type: "keyword" }
      }
    },
    address: {
      type: "text",
      analyzer: "french",
      fields: {
        keyword: { type: "keyword" }
      }
    },
    city: {
      type: "text",
      analyzer: "french",
      fields: {
        keyword: { type: "keyword" }
      }
    },
    // Géolocalisation pour recherche par proximité
    geoLocation: {
      type: "geo_point"
    },
    contact: {
      type: "keyword",
      index: false // Ne pas indexer pour la recherche
    },
    images: {
      type: "keyword",
      index: false
    },
    user: {
      properties: {
        id: { type: "keyword" },
        name: {
          type: "text",
          analyzer: "french"
        },
        phone: {
          type: "keyword",
          index: false
        },
        score: { type: "float" },
        verified: { type: "boolean" },
        address: {
          type: "text",
          analyzer: "french"
        },
        city: {
          type: "text",
          analyzer: "french",
          fields: {
            keyword: { type: "keyword" }
          }
        },
        userLocation: {
          type: "geo_point"
        }
      }
    },
    category: {
      properties: {
        id: { type: "keyword" },
        name: {
          type: "text",
          analyzer: "french"
        },
        slug: { type: "keyword" }
      }
    },
    createdAt: {
      type: "date"
    },
    updatedAt: {
      type: "date"
    }
  }
}

// Configuration de l'index avec analyseurs personnalisés
export const indexSettings = {
  analysis: {
    analyzer: {
      french: {
        tokenizer: "standard",
        filter: [
          "lowercase",
          "french_elision",
          "french_stop",
          "french_stemmer"
        ]
      },
      autocomplete: {
        tokenizer: "autocomplete_tokenizer",
        filter: ["lowercase"]
      }
    },
    tokenizer: {
      autocomplete_tokenizer: {
        type: "edge_ngram",
        min_gram: 2,
        max_gram: 20,
        token_chars: ["letter", "digit"]
      }
    },
    filter: {
      french_elision: {
        type: "elision",
        articles_case: true,
        articles: [
          "l", "m", "t", "qu", "n", "s",
          "j", "d", "c", "jusqu", "quoiqu",
          "lorsqu", "puisqu"
        ]
      },
      french_stop: {
        type: "stop",
        stopwords: "_french_"
      },
      french_stemmer: {
        type: "stemmer",
        language: "light_french"
      }
    }
  }
}

// Fonction pour créer l'index
export async function createElasticsearchIndex() {
  const indexName = process.env.ELASTICSEARCH_INDEX!

  try {
    // Vérifier si l'index existe déjà
    const indexExists = await elasticsearchClient.indices.exists({
      index: indexName
    })

    if (indexExists) {
      console.log(`✅ Index '${indexName}' existe déjà`)
      return { success: true, message: "Index already exists" }
    }

    // Créer l'index avec les settings et mapping
    const response = await elasticsearchClient.indices.create({
      index: indexName,
      settings: indexSettings as any,
      mappings: listingMapping as any
    })

    console.log(`✅ Index '${indexName}' créé avec succès`)
    return { success: true, message: "Index created successfully", response }

  } catch (error) {
    console.error(`❌ Erreur lors de la création de l'index '${indexName}':`, error)
    throw error
  }
}

// Fonction pour indexer une annonce
export async function indexListing(listing: any) {
  const indexName = process.env.ELASTICSEARCH_INDEX!

  try {
    const response = await elasticsearchClient.index({
      index: indexName,
      id: listing.id,
      document: {
        title: listing.title,
        description: listing.description,
        tags: listing.tags || [],
        price: listing.price,
        currency: listing.currency,
        type: listing.type,
        status: listing.status,
        location: listing.location,
        address: listing.address,
        city: listing.city,
        // Géolocalisation de l'annonce
        geoLocation: (listing.latitude && listing.longitude) ? {
          lat: listing.latitude,
          lon: listing.longitude
        } : null,
        contact: listing.contact,
        images: listing.images || [],
        user: {
          id: listing.user.id,
          name: listing.user.name,
          phone: listing.user.phone,
          score: listing.user.score || 0,
          verified: listing.user.verified || false,
          address: listing.user.address,
          city: listing.user.city,
          // Géolocalisation de l'utilisateur
          userLocation: (listing.user.latitude && listing.user.longitude) ? {
            lat: listing.user.latitude,
            lon: listing.user.longitude
          } : null
        },
        category: listing.category ? {
          id: listing.category.id,
          name: listing.category.name,
          slug: listing.category.slug
        } : null,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt
      }
    })

    console.log(`✅ Annonce '${listing.id}' indexée avec succès`)
    return response

  } catch (error) {
    console.error(`❌ Erreur lors de l'indexation de l'annonce '${listing.id}':`, error)
    throw error
  }
}

// Fonction pour supprimer une annonce de l'index
export async function deleteListing(listingId: string) {
  const indexName = process.env.ELASTICSEARCH_INDEX!

  try {
    const response = await elasticsearchClient.delete({
      index: indexName,
      id: listingId
    })

    console.log(`✅ Annonce '${listingId}' supprimée de l'index`)
    return response

  } catch (error: any) {
    if (error.meta?.statusCode === 404) {
      console.log(`⚠️ Annonce '${listingId}' non trouvée dans l'index`)
      return { found: false }
    }
    console.error(`❌ Erreur lors de la suppression de l'annonce '${listingId}':`, error)
    throw error
  }
}

// Fonction pour synchroniser toutes les annonces depuis la DB
export async function syncAllListings() {
  console.log("🔄 Synchronisation des annonces avec Elasticsearch...")

  try {
    const { PrismaClient } = await import("@prisma/client")
    const prisma = new PrismaClient()

    // Récupérer toutes les annonces actives avec leurs relations
    const listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            phone: true,
            score: true,
            verified: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    console.log(`📊 Trouvé ${listings.length} annonces à synchroniser`)

    let successCount = 0
    let errorCount = 0

    // Synchroniser chaque annonce
    for (const listing of listings) {
      try {
        await indexListing(listing)
        successCount++
      } catch (error) {
        console.error(`❌ Erreur lors de l'indexation de l'annonce ${listing.id}:`, error)
        errorCount++
      }
    }

    await prisma.$disconnect()

    console.log(`✅ Synchronisation terminée: ${successCount} réussies, ${errorCount} échouées`)

    return {
      success: true,
      message: "Sync completed",
      stats: {
        total: listings.length,
        success: successCount,
        errors: errorCount
      }
    }

  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation:", error)
    throw error
  }
}

// Fonction pour synchroniser les utilisateurs dans l'index
export async function syncAllUsers() {
  console.log("🔄 Synchronisation des utilisateurs avec Elasticsearch...")

  try {
    const { PrismaClient } = await import("@prisma/client")
    const prisma = new PrismaClient()

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        score: true,
        verified: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true
      }
    })

    console.log(`📊 Trouvé ${users.length} utilisateurs à synchroniser`)

    let successCount = 0
    let errorCount = 0

    // Indexer chaque utilisateur dans un index séparé
    for (const user of users) {
      try {
        await indexUser(user)
        successCount++
      } catch (error) {
        console.error(`❌ Erreur lors de l'indexation de l'utilisateur ${user.id}:`, error)
        errorCount++
      }
    }

    await prisma.$disconnect()

    console.log(`✅ Synchronisation utilisateurs terminée: ${successCount} réussies, ${errorCount} échouées`)

    return {
      success: true,
      message: "User sync completed",
      stats: {
        total: users.length,
        success: successCount,
        errors: errorCount
      }
    }

  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation des utilisateurs:", error)
    throw error
  }
}

// Fonction pour indexer un utilisateur
export async function indexUser(user: any) {
  const indexName = `${process.env.ELASTICSEARCH_INDEX}_users`

  try {
    const response = await elasticsearchClient.index({
      index: indexName,
      id: user.id,
      body: {
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        score: user.score || 0,
        verified: user.verified || false,
        verificationStatus: user.verificationStatus || "PENDING",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

    console.log(`✅ Utilisateur '${user.id}' indexé avec succès`)
    return response

  } catch (error) {
    console.error(`❌ Erreur lors de l'indexation de l'utilisateur '${user.id}':`, error)
    throw error
  }
}

// Fonction pour supprimer un utilisateur de l'index
export async function deleteUser(userId: string) {
  const indexName = `${process.env.ELASTICSEARCH_INDEX}_users`

  try {
    const response = await elasticsearchClient.delete({
      index: indexName,
      id: userId
    })

    console.log(`✅ Utilisateur '${userId}' supprimé de l'index`)
    return response

  } catch (error) {
    if (error.meta?.statusCode === 404) {
      console.log(`⚠️ Utilisateur '${userId}' non trouvé dans l'index`)
      return { found: false }
    }
    console.error(`❌ Erreur lors de la suppression de l'utilisateur '${userId}':`, error)
    throw error
  }
}

// Hooks Prisma pour auto-synchronisation
export const createPrismaHooks = () => {
  const { PrismaClient } = require("@prisma/client")

  return {
    // Hook pour les annonces
    async afterListingCreate(listing: any) {
      try {
        await indexListing(listing)
      } catch (error) {
        console.error("Erreur auto-sync création annonce:", error)
      }
    },

    async afterListingUpdate(listing: any) {
      try {
        await indexListing(listing)
      } catch (error) {
        console.error("Erreur auto-sync mise à jour annonce:", error)
      }
    },

    async afterListingDelete(listingId: string) {
      try {
        await deleteListing(listingId)
      } catch (error) {
        console.error("Erreur auto-sync suppression annonce:", error)
      }
    },

    // Hook pour les utilisateurs
    async afterUserCreate(user: any) {
      try {
        await indexUser(user)
      } catch (error) {
        console.error("Erreur auto-sync création utilisateur:", error)
      }
    },

    async afterUserUpdate(user: any) {
      try {
        await indexUser(user)
      } catch (error) {
        console.error("Erreur auto-sync mise à jour utilisateur:", error)
      }
    },

    async afterUserDelete(userId: string) {
      try {
        await deleteUser(userId)
      } catch (error) {
        console.error("Erreur auto-sync suppression utilisateur:", error)
      }
    }
  }
}

// Fonction de test de connexion
export async function testElasticsearchConnection() {
  try {
    const health = await elasticsearchClient.cluster.health()
    const info = await elasticsearchClient.info()

    return {
      connected: true,
      cluster_health: health.status || health.body?.status,
      elasticsearch_version: info.version?.number || info.body?.version?.number,
      cluster_name: health.cluster_name || health.body?.cluster_name
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}