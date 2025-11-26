import { NextResponse } from "next/server"
import { createElasticsearchIndex, testElasticsearchConnection } from "@/lib/elasticsearch"

// POST - Créer l'index Elasticsearch
export async function POST() {
  try {
    console.log("🚀 Début de la configuration Elasticsearch...")

    // Test de connexion
    const connectionTest = await testElasticsearchConnection()
    if (!connectionTest.connected) {
      return NextResponse.json({
        success: false,
        error: "Impossible de se connecter à Elasticsearch",
        details: connectionTest.error
      }, { status: 500 })
    }

    console.log("✅ Connexion Elasticsearch établie")

    // Créer l'index
    const indexResult = await createElasticsearchIndex()

    return NextResponse.json({
      success: true,
      message: "Configuration Elasticsearch terminée",
      connection: connectionTest,
      index: indexResult
    })

  } catch (error) {
    console.error("❌ Erreur lors de la configuration Elasticsearch:", error)

    return NextResponse.json({
      success: false,
      error: "Erreur lors de la configuration Elasticsearch",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// GET - Status de la configuration
export async function GET() {
  try {
    const connectionTest = await testElasticsearchConnection()

    return NextResponse.json({
      elasticsearch: connectionTest,
      environment: {
        node: process.env.ELASTICSEARCH_NODE,
        index: process.env.ELASTICSEARCH_INDEX,
        username: process.env.ELASTICSEARCH_USERNAME,
        hasPassword: !!process.env.ELASTICSEARCH_PASSWORD
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}