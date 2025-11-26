import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { syncAllListings, syncAllUsers, createElasticsearchIndex } from "@/lib/elasticsearch"

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
    const { type } = body

    if (!type) {
      return NextResponse.json(
        { error: "Type de synchronisation requis" },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case "listings":
        console.log("🔄 Démarrage de la synchronisation des annonces...")
        result = await syncAllListings()
        break

      case "users":
        console.log("🔄 Démarrage de la synchronisation des utilisateurs...")
        result = await syncAllUsers()
        break

      case "all":
        console.log("🔄 Démarrage de la synchronisation complète...")

        // Créer les index si nécessaire
        await createElasticsearchIndex()

        // Synchroniser les annonces et utilisateurs
        const [listingsResult, usersResult] = await Promise.all([
          syncAllListings(),
          syncAllUsers()
        ])

        result = {
          success: true,
          message: "Synchronisation complète terminée",
          listings: listingsResult.stats,
          users: usersResult.stats
        }
        break

      case "setup":
        console.log("🏗️ Configuration de l'index Elasticsearch...")
        result = await createElasticsearchIndex()
        break

      default:
        return NextResponse.json(
          { error: "Type de synchronisation invalide. Utilisez: listings, users, all, ou setup" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error("❌ Erreur lors de la synchronisation:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// GET pour vérifier le statut d'Elasticsearch
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const { testElasticsearchConnection } = await import("@/lib/elasticsearch")
    const connectionStatus = await testElasticsearchConnection()

    return NextResponse.json({
      success: true,
      data: connectionStatus
    })

  } catch (error) {
    console.error("❌ Erreur lors du test de connexion:", error)
    return NextResponse.json(
      { error: "Erreur lors du test de connexion" },
      { status: 500 }
    )
  }
}