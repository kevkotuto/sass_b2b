import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { VerificationStatus } from "@/types/verification"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { requestId, action, adminNotes } = body

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      )
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Action invalide" },
        { status: 400 }
      )
    }

    // Récupérer la demande de vérification
    const verificationRequest = await prisma.verificationRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    })

    if (!verificationRequest) {
      return NextResponse.json(
        { error: "Demande de vérification non trouvée" },
        { status: 404 }
      )
    }

    if (verificationRequest.status !== VerificationStatus.SUBMITTED) {
      return NextResponse.json(
        { error: "Cette demande a déjà été traitée" },
        { status: 400 }
      )
    }

    const newStatus = action === "approve" ? VerificationStatus.APPROVED : VerificationStatus.REJECTED
    const isVerified = action === "approve"

    // Mettre à jour la demande de vérification et l'utilisateur dans une transaction
    await prisma.$transaction(async (tx) => {
      // Mettre à jour la demande de vérification
      await tx.verificationRequest.update({
        where: { id: requestId },
        data: {
          status: newStatus,
          reviewedAt: new Date(),
          reviewedById: session.user!.id,
          adminNotes: adminNotes || null
        }
      })

      // Mettre à jour le statut de l'utilisateur
      await tx.user.update({
        where: { id: verificationRequest.userId },
        data: {
          verified: isVerified,
          verificationStatus: newStatus
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `Demande ${action === "approve" ? "approuvée" : "rejetée"} avec succès`
    })

  } catch (error) {
    console.error("Erreur lors du traitement de la demande:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}