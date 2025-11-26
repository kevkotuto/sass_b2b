import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { Gender, VerificationStatus } from "@/types/verification"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password, firstName, lastName, age, gender } = body

    // Validation des données
    if (!phone || !password || !firstName || !lastName || !age || !gender) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec ce numéro de téléphone existe déjà" },
        { status: 400 }
      )
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        firstName,
        lastName,
        age: parseInt(age),
        gender: gender as Gender,
        verificationStatus: VerificationStatus.PENDING,
        verified: false,
        isAdmin: false,
        score: 50.0,
        totalRating: 0.0,
        ratingCount: 0
      }
    })

    // Retourner les données utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: "Compte créé avec succès",
      user: userWithoutPassword
    })

  } catch (error) {
    console.error("Erreur lors de la création du compte:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}