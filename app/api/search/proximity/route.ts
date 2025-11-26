import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, radius = 10, query, category } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json({
        error: 'Latitude et longitude requises'
      }, { status: 400 })
    }

    console.log(`🌍 Recherche par proximité: lat=${latitude}, lng=${longitude}, radius=${radius}km`)

    // Recherche avec calcul de distance en utilisant Prisma de manière plus sûre
    let whereClause: any = {
      status: 'ACTIVE',
      latitude: { not: null },
      longitude: { not: null }
    }

    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (category) {
      whereClause.category = { slug: category }
    }

    const allListings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            score: true,
            verified: true,
            address: true,
            city: true
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

    // Calculer la distance et filtrer par rayon
    const listingsWithDistance = allListings
      .map(listing => {
        if (!listing.latitude || !listing.longitude) return null

        // Formule de Haversine pour calculer la distance
        const R = 6371 // Rayon de la Terre en km
        const dLat = (listing.latitude - latitude) * Math.PI / 180
        const dLon = (listing.longitude - longitude) * Math.PI / 180
        const a =
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(latitude * Math.PI / 180) * Math.cos(listing.latitude * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c

        return {
          ...listing,
          distance: Math.round(distance * 100) / 100
        }
      })
      .filter((listing): listing is NonNullable<typeof listing> => listing !== null && listing.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 50)

    console.log(`📍 Trouvé ${listingsWithDistance.length} annonces dans un rayon de ${radius}km`)

    return NextResponse.json({
      success: true,
      listings: listingsWithDistance,
      searchParams: {
        latitude,
        longitude,
        radius,
        query: query || null,
        category: category || null
      },
      count: listingsWithDistance.length
    })


  } catch (error: any) {
    console.error('❌ Erreur lors de la recherche par proximité:', error)
    return NextResponse.json({
      error: 'Erreur lors de la recherche',
      details: error.message
    }, { status: 500 })
  }
}