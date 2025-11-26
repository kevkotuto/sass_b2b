import { NextResponse } from 'next/server'
import {
  testElasticsearchConnection,
  createElasticsearchIndex,
  syncAllListings
} from '@/lib/elasticsearch'

export async function GET() {
  try {
    console.log('🔍 Test de connexion Elasticsearch...')

    // Test de connexion
    const connectionTest = await testElasticsearchConnection()
    console.log('Résultat de connexion:', connectionTest)

    if (!connectionTest.connected) {
      return NextResponse.json({
        error: 'Connexion Elasticsearch échouée',
        details: connectionTest
      }, { status: 500 })
    }

    // Création de l'index
    console.log('📊 Création de l\'index...')
    const indexResult = await createElasticsearchIndex()
    console.log('Index créé:', indexResult)

    // Synchronisation des données
    console.log('🔄 Synchronisation des annonces...')
    const syncResult = await syncAllListings()
    console.log('Synchronisation terminée:', syncResult)

    return NextResponse.json({
      success: true,
      connection: connectionTest,
      index: indexResult,
      sync: syncResult,
      message: 'Test Elasticsearch terminé avec succès'
    })

  } catch (error: any) {
    console.error('❌ Erreur lors du test Elasticsearch:', error)
    return NextResponse.json({
      error: 'Erreur lors du test Elasticsearch',
      details: error.message
    }, { status: 500 })
  }
}