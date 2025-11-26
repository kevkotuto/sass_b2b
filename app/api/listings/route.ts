import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Récupérer les annonces
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const categoryId = searchParams.get("categoryId")
    const type = searchParams.get("type")
    const status = searchParams.get("status") || "ACTIVE"

    const where: any = {
      status
    }

    if (userId) where.userId = userId
    if (categoryId) where.categoryId = categoryId
    if (type) where.type = type

    const listings = await prisma.listing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            score: true,
            verified: true
          }
        },
        category: true,
        _count: {
          select: {
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des annonces" },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle annonce
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Utiliser json au lieu de formData car on envoie des données JSON
    const body = await request.json()

    // Récupérer les données
    const {
      title,
      description,
      type,
      categoryId,
      price,
      currency = "CFA",
      location,
      address,
      city,
      contact,
      tags = [],
      images = []
    } = body

    // Validation basique
    console.log("📝 Données reçues:", { title, description, type, categoryId, location, city })

    if (!title || !description || !type || !categoryId || !location || !city) {
      const missingFields = []
      if (!title) missingFields.push('title')
      if (!description) missingFields.push('description')
      if (!type) missingFields.push('type')
      if (!categoryId) missingFields.push('categoryId')
      if (!location) missingFields.push('location')
      if (!city) missingFields.push('city')

      console.log("❌ Champs manquants:", missingFields)
      return NextResponse.json(
        { error: `Données manquantes: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Créer l'annonce
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        type,
        price,
        currency: currency as any,
        location,
        address,
        city,
        contact,
        tags,
        images,
        userId: session.user.id,
        categoryId,
        status: "ACTIVE"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            score: true,
            verified: true
          }
        },
        category: true
      }
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de l'annonce:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de l'annonce" },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une annonce
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: "ID de l'annonce requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est propriétaire de l'annonce
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    if (existingListing.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      )
    }

    // Mettre à jour l'annonce
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true,
            score: true,
            verified: true
          }
        },
        category: true
      }
    })

    return NextResponse.json(updatedListing)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'annonce:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'annonce" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une annonce
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID de l'annonce requis" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur est propriétaire de l'annonce
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!existingListing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    if (existingListing.userId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      )
    }

    // Supprimer l'annonce (soft delete en changeant le statut)
    await prisma.listing.update({
      where: { id },
      data: {
        status: "INACTIVE"
      }
    })

    return NextResponse.json(
      { message: "Annonce supprimée avec succès" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'annonce" },
      { status: 500 }
    )
  }
}