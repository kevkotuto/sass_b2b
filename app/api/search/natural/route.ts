import { NextRequest, NextResponse } from "next/server"
import { analyzeNaturalLanguageSearch, buildElasticsearchQuery } from "@/lib/langchain"
import { Client } from "@elastic/elasticsearch"

// Configuration Elasticsearch
const elasticsearchClient = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME!,
    password: process.env.ELASTICSEARCH_PASSWORD!,
  },
  tls: {
    rejectUnauthorized: false // Pour les certificats auto-signés
  }
})

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: "Query is required and must be a string" },
        { status: 400 }
      )
    }

    console.log(`🔍 Recherche naturelle: "${query}"`)

    // Étape 1: Analyse avec LangChain
    const analysis = await analyzeNaturalLanguageSearch(query)

    console.log("📊 Analyse LangChain terminée:", {
      elements: analysis.elements.length,
      intent: analysis.searchIntent
    })

    // Étape 2: Exécution des requêtes Elasticsearch avec fallback en cascade
    const searchPromises = analysis.elements.map(async (element, index) => {
      console.log(`🔎 Recherche ${index + 1}: "${element.description}" (${element.type}/${element.category})`)

      // Fallback en cascade: 3 niveaux de recherche
      const fallbackLevels = [
        { level: 0, description: "strict (catégorie + type + géolocalisation)" },
        { level: 1, description: "modéré (type + géolocalisation élargie)" },
        { level: 2, description: "large (mots-clés uniquement)" }
      ]

      for (const { level, description } of fallbackLevels) {
        try {
          console.log(`🎯 Niveau ${level}: ${description}`)

          const esQuery = buildElasticsearchQuery(element, process.env.ELASTICSEARCH_INDEX, level)
          console.log(`📊 Requête ES niveau ${level}:`, JSON.stringify(esQuery.query.bool, null, 2))

          const response = await elasticsearchClient.search(esQuery)
          const hits = response.hits?.hits || []
          const total = typeof response.hits?.total === 'number'
            ? response.hits.total
            : response.hits?.total?.value || 0

          console.log(`✅ Niveau ${level} - Résultats trouvés: ${total}`)

          // Si on trouve des résultats, on s'arrête
          if (total > 0) {
            return {
              element,
              results: hits.map((hit: any) => ({
                id: hit._id,
                score: hit._score,
                source: hit._source,
                highlight: hit.highlight || {},
                searchLevel: level // Pour debugging
              })),
              total,
              searchLevel: level
            }
          }
        } catch (elasticError) {
          console.error(`❌ Erreur Elasticsearch niveau ${level} pour "${element.description}":`, elasticError)
          // Continuer avec le niveau suivant
        }
      }

      // Si aucun niveau n'a fonctionné
      console.log(`🚫 Aucun résultat trouvé pour "${element.description}" sur tous les niveaux`)
      return {
        element,
        results: [],
        total: 0,
        searchLevel: -1,
        error: "No results found at any fallback level"
      }
    })

    // Attendre tous les résultats
    const searchResults = await Promise.all(searchPromises)

    // Étape 3: Agrégation et scoring des résultats
    const combinedResults = searchResults.reduce((acc, result) => {
      return [...acc, ...result.results.map(r => ({
        ...r,
        searchElement: result.element.description,
        category: result.element.category,
        type: result.element.type
      }))]
    }, [] as any[])

    // Tri par pertinence (score Elasticsearch + score utilisateur)
    combinedResults.sort((a, b) => {
      const scoreA = a.score + (a.source.user?.score || 0) / 10
      const scoreB = b.score + (b.source.user?.score || 0) / 10
      return scoreB - scoreA
    })

    console.log(`✅ Recherche terminée: ${combinedResults.length} résultats trouvés`)

    return NextResponse.json({
      query,
      analysis: {
        intent: analysis.searchIntent,
        elements: analysis.elements.map(e => ({
          type: e.type,
          category: e.category,
          description: e.description,
          keywords: e.keywords
        }))
      },
      results: combinedResults.slice(0, 50), // Limite à 50 résultats
      searchResults, // Résultats détaillés par élément
      total: combinedResults.length,
      processingTime: Date.now()
    })

  } catch (error) {
    console.error("❌ Erreur lors de la recherche naturelle:", error)

    return NextResponse.json(
      {
        error: "Internal server error during natural language search",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

// GET pour tester la connexion Elasticsearch
export async function GET() {
  try {
    const health = await elasticsearchClient.cluster.health()
    const indexExists = await elasticsearchClient.indices.exists({
      index: process.env.ELASTICSEARCH_INDEX!
    })

    return NextResponse.json({
      status: "ok",
      elasticsearch: {
        connected: true,
        cluster_health: health.status,
        index_exists: indexExists
      },
      environment: {
        node: process.env.ELASTICSEARCH_NODE,
        index: process.env.ELASTICSEARCH_INDEX,
        hasOpenAI: !!process.env.OPENAI_API_KEY
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      elasticsearch: {
        connected: false,
        error: error instanceof Error ? error.message : "Connection failed"
      }
    }, { status: 500 })
  }
}