import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { VerificationStatus } from "@/types/verification"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Récupérer les statistiques en parallèle
    const [
      totalUsers,
      verifiedUsers,
      pendingVerifications,
      totalListings,
      activeListings
    ] = await Promise.all([
      // Total utilisateurs
      prisma.user.count(),

      // Utilisateurs vérifiés
      prisma.user.count({
        where: { verified: true }
      }),

      // Vérifications en attente
      prisma.verificationRequest.count({
        where: { status: VerificationStatus.SUBMITTED }
      }),

      // Total annonces
      prisma.listing.count(),

      // Annonces actives
      prisma.listing.count({
        where: { status: "ACTIVE" }
      })
    ])

    const stats = {
      totalUsers,
      verifiedUsers,
      pendingVerifications,
      totalListings,
      activeListings
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des stats:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}