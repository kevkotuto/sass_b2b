import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import sharp from "sharp"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const uploadedFiles: string[] = []

    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = join(process.cwd(), "public", "uploads")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Créer un sous-dossier pour l'année et le mois
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const dateFolder = join(uploadDir, year.toString(), month)

    if (!existsSync(dateFolder)) {
      await mkdir(dateFolder, { recursive: true })
    }

    // Traiter chaque fichier
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && key.startsWith("image")) {
        // Vérifier le type de fichier
        if (!ALLOWED_FILE_TYPES.includes(value.type)) {
          return NextResponse.json(
            { error: `Type de fichier non autorisé: ${value.type}` },
            { status: 400 }
          )
        }

        // Vérifier la taille
        if (value.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "Fichier trop volumineux (max 5MB)" },
            { status: 400 }
          )
        }

        // Générer un nom unique
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        const fileExtension = value.name.split(".").pop()?.toLowerCase() || "jpg"
        const fileName = `${session.user.id}-${uniqueSuffix}.${fileExtension}`

        // Convertir le fichier en buffer
        const bytes = await value.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Optimiser l'image avec sharp
        try {
          // Image principale (max 1200px de large)
          const optimizedBuffer = await sharp(buffer)
            .resize(1200, null, {
              fit: "inside",
              withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toBuffer()

          // Sauvegarder l'image principale
          const filePath = join(dateFolder, fileName)
          await writeFile(filePath, optimizedBuffer)

          // Créer une miniature (300px)
          const thumbnailBuffer = await sharp(buffer)
            .resize(300, 300, {
              fit: "cover"
            })
            .jpeg({ quality: 80 })
            .toBuffer()

          // Sauvegarder la miniature
          const thumbnailName = `thumb-${fileName}`
          const thumbnailPath = join(dateFolder, thumbnailName)
          await writeFile(thumbnailPath, thumbnailBuffer)

          // Retourner l'URL relative
          const publicUrl = `/uploads/${year}/${month}/${fileName}`

          uploadedFiles.push(publicUrl)

          console.log(`✅ Image uploadée: ${publicUrl}`)
        } catch (imageError) {
          console.error("Erreur lors du traitement de l'image:", imageError)
          return NextResponse.json(
            { error: "Erreur lors du traitement de l'image" },
            { status: 500 }
          )
        }
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: "Aucun fichier valide trouvé" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      urls: uploadedFiles,
      message: `${uploadedFiles.length} image(s) uploadée(s) avec succès`
    })

  } catch (error) {
    console.error("Erreur lors de l'upload:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'upload des images" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer une image
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL de l'image requise" },
        { status: 400 }
      )
    }

    // Vérifier que l'URL est dans le bon format et appartient à l'utilisateur
    if (!imageUrl.includes(session.user.id)) {
      return NextResponse.json(
        { error: "Non autorisé à supprimer cette image" },
        { status: 403 }
      )
    }

    // TODO: Implémenter la suppression physique du fichier si nécessaire

    return NextResponse.json({
      success: true,
      message: "Image supprimée avec succès"
    })

  } catch (error) {
    console.error("Erreur lors de la suppression:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'image" },
      { status: 500 }
    )
  }
}