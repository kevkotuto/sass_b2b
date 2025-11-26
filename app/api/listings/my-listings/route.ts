import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "../../../../lib/prisma"

// GET - Récupérer les annonces de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "ACTIVE"
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {
      userId: session.user.id
    }

    // Filtrer par statut si spécifié
    if (status !== "ALL") {
      where.status = status
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
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
      take: limit,
      skip: offset
    })

    // Compter le total pour la pagination
    const total = await prisma.listing.count({ where })

    return NextResponse.json({
      listings,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces utilisateur:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des annonces" },
      { status: 500 }
    )
  }
}