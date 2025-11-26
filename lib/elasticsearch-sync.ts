import { Client } from "@elastic/elasticsearch"
import { PrismaClient, Listing, User, Category } from "@prisma/client"

// Configuration Elasticsearch
const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME!,
    password: process.env.ELASTICSEARCH_PASSWORD!,
  },
  tls: {
    rejectUnauthorized: false
  }
})

const INDEX_NAME = process.env.ELASTICSEARCH_INDEX || 'sass_alexi'

// Types pour les annonces avec relations
type ListingWithRelations = Listing & {
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    name: string | null
    phone: string
    score: number
    verified: boolean
    city: string | null
    latitude: number | null
    longitude: number | null
  }
  category: {
    id: string
    name: string
    slug: string
  }
}

// Transformer une annonce pour Elasticsearch
function transformListingForES(listing: ListingWithRelations) {
  return {
    title: listing.title,
    description: listing.description,
    tags: listing.tags,
    price: listing.price,
    currency: listing.currency,
    type: listing.type,
    status: listing.status,
    location: listing.location,
    address: listing.address,
    city: listing.city,
    geoLocation: listing.latitude && listing.longitude ? {
      lat: listing.latitude,
      lon: listing.longitude
    } : null,
    contact: listing.contact,
    images: listing.images,
    user: {
      id: listing.user.id,
      name: listing.user.firstName && listing.user.lastName
        ? `${listing.user.firstName} ${listing.user.lastName}`
        : listing.user.name,
      phone: listing.user.phone,
      score: listing.user.score,
      verified: listing.user.verified,
      userLocation: listing.user.latitude && listing.user.longitude ? {
        lat: listing.user.latitude,
        lon: listing.user.longitude
      } : null
    },
    category: {
      id: listing.category.id,
      name: listing.category.name,
      slug: listing.category.slug
    },
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString()
  }
}

// Synchroniser une annonce vers Elasticsearch
export async function syncListingToES(listingId: string, action: 'create' | 'update' | 'delete') {
  try {
    console.log(`🔄 Synchronisation ES: ${action} listing ${listingId}`)

    if (action === 'delete') {
      await esClient.delete({
        index: INDEX_NAME,
        id: listingId
      })
      console.log(`✅ Listing ${listingId} supprimé d'Elasticsearch`)
      return { success: true, action: 'deleted' }
    }

    // Pour create/update, récupérer l'annonce avec ses relations
    const prisma = new PrismaClient()

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            phone: true,
            score: true,
            verified: true,
            city: true,
            latitude: true,
            longitude: true
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

    await prisma.$disconnect()

    if (!listing) {
      console.log(`❌ Listing ${listingId} non trouvé en base`)
      return { success: false, error: 'Listing not found' }
    }

    // Ne synchroniser que les annonces ACTIVE
    if (listing.status !== 'ACTIVE') {
      // Supprimer de ES si l'annonce n'est plus active
      try {
        await esClient.delete({
          index: INDEX_NAME,
          id: listingId
        })
        console.log(`🗑️ Listing ${listingId} retiré d'ES (status: ${listing.status})`)
      } catch (error) {
        // Ignorer si le document n'existe pas déjà
      }
      return { success: true, action: 'removed_inactive' }
    }

    // Transformer et indexer
    const esDoc = transformListingForES(listing as ListingWithRelations)

    await esClient.index({
      index: INDEX_NAME,
      id: listingId,
      body: esDoc
    })

    console.log(`✅ Listing ${listingId} synchronisé vers Elasticsearch`)
    return { success: true, action: action === 'create' ? 'created' : 'updated' }

  } catch (error) {
    console.error(`❌ Erreur lors de la synchronisation ES (${action}):`, error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Synchroniser plusieurs annonces en batch
export async function syncMultipleListingsToES(listingIds: string[], action: 'create' | 'update') {
  try {
    console.log(`🔄 Synchronisation batch ES: ${action} ${listingIds.length} listings`)

    if (listingIds.length === 0) return { success: true, processed: 0 }

    const prisma = new PrismaClient()

    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        status: 'ACTIVE' // Ne synchroniser que les annonces actives
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            phone: true,
            score: true,
            verified: true,
            city: true,
            latitude: true,
            longitude: true
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

    await prisma.$disconnect()

    if (listings.length === 0) {
      console.log(`ℹ️ Aucune annonce active trouvée parmi ${listingIds.length} IDs`)
      return { success: true, processed: 0 }
    }

    // Préparer les opérations bulk
    const operations: any[] = []

    for (const listing of listings) {
      const esDoc = transformListingForES(listing as ListingWithRelations)

      operations.push(
        { index: { _index: INDEX_NAME, _id: listing.id } },
        esDoc
      )
    }

    // Exécuter le bulk
    const response = await esClient.bulk({ operations })

    const indexed = response.items?.filter(item =>
      item.index?.result === 'created' || item.index?.result === 'updated'
    ).length || 0

    const errors = response.items?.filter(item => item.index?.error).length || 0

    console.log(`✅ Synchronisation batch terminée: ${indexed} succès, ${errors} erreurs`)

    return {
      success: true,
      processed: listings.length,
      indexed,
      errors: errors > 0 ? response.items?.filter(item => item.index?.error) : []
    }

  } catch (error) {
    console.error(`❌ Erreur lors de la synchronisation batch ES:`, error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Vérifier la santé d'Elasticsearch
export async function checkElasticsearchHealth() {
  try {
    const health = await esClient.cluster.health()
    const indexExists = await esClient.indices.exists({ index: INDEX_NAME })

    return {
      connected: true,
      cluster_health: health.status,
      index_exists: indexExists
    }
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Hook pour logs et monitoring
export function logSyncOperation(operation: string, listingId: string, result: any) {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ES_SYNC: ${operation} - Listing ${listingId} - Result:`, result)

  // Ici on pourrait ajouter des métriques, logs vers un service externe, etc.
}