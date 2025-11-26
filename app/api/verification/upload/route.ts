import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { DocumentType, VerificationStatus } from "@/types/verification"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('document') as File
    const documentType = formData.get('documentType') as DocumentType

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    if (!documentType) {
      return NextResponse.json(
        { error: "Type de document requis" },
        { status: 400 }
      )
    }

    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé" },
        { status: 400 }
      )
    }

    // Taille max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 10MB)" },
        { status: 400 }
      )
    }

    // Vérifier s'il y a déjà une demande en cours
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: {
        userId: session.user.id,
        status: VerificationStatus.SUBMITTED
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "Vous avez déjà une demande de vérification en cours" },
        { status: 400 }
      )
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'verification')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Le dossier existe déjà
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `${session.user.id}_${timestamp}.${extension}`
    const filePath = join(uploadsDir, fileName)
    const publicUrl = `/uploads/verification/${fileName}`

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Récupérer les informations de la requête
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded?.split(",")[0] ?? request.headers.get("x-real-ip") ?? "unknown"
    const userAgent = request.headers.get("user-agent") ?? "unknown"

    // Créer la demande de vérification
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId: session.user.id,
        documentType,
        documentUrl: publicUrl,
        documentName: file.name,
        status: VerificationStatus.SUBMITTED,
        ipAddress: ip,
        userAgent
      }
    })

    // Mettre à jour le statut de l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: { verificationStatus: VerificationStatus.SUBMITTED }
    })

    return NextResponse.json({
      success: true,
      data: {
        requestId: verificationRequest.id,
        status: VerificationStatus.SUBMITTED,
        message: "Document envoyé avec succès"
      }
    })

  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// API pour récupérer les demandes de vérification d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const verificationRequests = await prisma.verificationRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        documentType: true,
        status: true,
        submittedAt: true,
        reviewedAt: true,
        adminNotes: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: verificationRequests
    })

  } catch (error) {
    console.error("Erreur lors de la récupération:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}