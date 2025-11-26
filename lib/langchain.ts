import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"
import { RunnableSequence } from "@langchain/core/runnables"
import { findLocation, getMainCity } from "./geography-africa"

// Configuration du modèle OpenAI
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.1,
  openAIApiKey: process.env.OPENAI_API_KEY,
})

// Template pour l'analyse de recherche naturelle
const searchAnalysisTemplate = PromptTemplate.fromTemplate(`
Tu es un assistant expert qui analyse les demandes de recherche d'utilisateurs pour une marketplace de services et produits en Afrique francophone.

DEMANDE UTILISATEUR: {userQuery}

ANALYSE SÉMANTIQUE:
1. Comprends l'INTENTION complète derrière la demande
2. Identifie les CONCEPTS PRINCIPAUX et leurs relations
3. Détermine s'il s'agit de SERVICES (prestations, cours, réparations, consulting) ou PRODUITS (objets physiques)
4. Extrais les ENTITÉS NOMMÉES (lieux, marques, spécifications)
5. Détecte les MODIFICATEURS (qualité, prix, urgence, préférences)

EXEMPLES DE COMPRÉHENSION:
- "je cherche des cours de math" → SERVICE éducatif (mathématiques, enseignement, formation)
- "plombier urgent à Dakar" → SERVICE réparation (plomberie, dépannage, Dakar, urgent)
- "vente iPhone 13 128Go" → PRODUIT technologie (smartphone, Apple, stockage)
- "femme de ménage 2 fois par semaine" → SERVICE domestique (nettoyage, récurrent)
- "moto-taxi à Abidjan" → SERVICE transport (moto-taxi, transport, Abidjan)
- "cours de français à Treichville" → SERVICE éducation (français, langue, Treichville, Abidjan)

CATEGORIES PRINCIPALES:
- SERVICES: education, reparation, domestique, transport, sante, beaute, consulting, livraison
- PRODUITS: technologie, vetements, mobilier, vehicules, electromenager, alimentaire, livres

GÉOLOCALISATION INTELLIGENTE AFRICAINE:
Système avancé de détection automatique des lieux en Afrique :

PAYS SUPPORTÉS:
- Sénégal (Dakar, Thiès, Saint-Louis, Kaolack, Mbour, Touba...)
- Côte d'Ivoire (Abidjan, Yamoussoukro, Bouaké, Daloa...)
- Mali (Bamako, Sikasso...)
- Burkina Faso (Ouagadougou, Bobo-Dioulasso...)
- Guinée (Conakry...)
- Ghana (Accra, Kumasi...)
- Nigeria (Lagos, Abuja, Kano...)
- Maroc (Casablanca, Rabat, Marrakech, Fès...)

VILLES PRINCIPALES + QUARTIERS:
- Dakar: Plateau, Almadies, Mermoz, Point E, Sacré-Cœur, Fann, Parcelles Assainies
- Abidjan: Treichville, Plateau, Cocody, Yopougon, Adjamé, Marcory, Koumassi, Abobo
- Pikine, Rufisque, Guédiawaye (banlieue Dakar)

DÉTECTION CONTEXTUELLE AVANCÉE:
- "services à Abidjan" → location: "Abidjan"
- "Treichville" → location: "Abidjan" (auto-détection ville parent)
- "plombier à Cocody" → location: "Abidjan"
- "cours à Plateau" → ambiguë → analyse contexte (Dakar ou Abidjan)
- "moto-taxi Lagos" → location: "Lagos"
- "formation Casablanca" → location: "Casablanca"

FORMAT DE RÉPONSE (JSON valide uniquement):
{{
  "elements": [
    {{
      "type": "SERVICE" | "PRODUCT",
      "category": "catégorie principale (education, reparation, technologie, etc.)",
      "keywords": ["concepts-clés", "synonymes", "termes-techniques"],
      "description": "intention précise de l'utilisateur",
      "filters": {{
        "priceRange": {{ "min": number | null, "max": number | null }},
        "location": "ville/région" | null,
        "specificRequirements": ["critères-spécifiques"]
      }}
    }}
  ],
  "searchIntent": "reformulation claire de ce que cherche l'utilisateur",
  "elasticsearchQueries": [
    {{
      "query": "requête optimisée avec synonymes et concepts",
      "filters": {{ "type": "SERVICE|PRODUCT", "category": "...", ... }}
    }}
  ]
}}

QUALITÉ ATTENDUE:
- Précision sémantique maximale
- Détection des synonymes et variantes
- Compréhension du contexte africain/francophone
- Gestion des abréviations et argot local

Analyse maintenant:
`)

// Parser pour extraire le JSON
const outputParser = new StringOutputParser()

// Chaîne LangChain pour l'analyse
export const searchAnalysisChain = RunnableSequence.from([
  searchAnalysisTemplate,
  model,
  outputParser,
])

// Interface pour les résultats
export interface SearchElement {
  type: "SERVICE" | "PRODUCT"
  category: string
  keywords: string[]
  description: string
  filters: {
    priceRange: { min: number | null; max: number | null }
    location: string | null
    specificRequirements: string[]
  }
}

export interface SearchAnalysisResult {
  elements: SearchElement[]
  searchIntent: string
  elasticsearchQueries: Array<{
    query: string
    filters: Record<string, any>
  }>
}

// Fallback intelligent sans IA
function createIntelligentFallback(userQuery: string): SearchAnalysisResult {
  const query = userQuery.toLowerCase().trim()
  const preprocessedQuery = preprocessQuery(userQuery)

  // Détection intelligente du type et de la catégorie - SYSTÈME GÉNÉRIQUE
  const serviceKeywords = [
    // Éducation & Formation
    'cours', 'formation', 'apprendre', 'enseigner', 'professeur', 'prof', 'tuteur', 'coaching',
    'école', 'université', 'stage', 'apprentissage', 'certification', 'diplôme',

    // Services techniques
    'réparation', 'réparer', 'dépanner', 'dépannage', 'fixer', 'maintenance', 'installation',
    'plombier', 'électricien', 'mécanicien', 'technicien', 'ingénieur',

    // Services domestiques
    'nettoyage', 'nettoyer', 'ménage', 'femme de ménage', 'lessive', 'repassage',
    'jardinage', 'jardinier', 'sécurité', 'gardien', 'baby-sitting', 'garde',

    // Transport & Livraison
    'livraison', 'livrer', 'transport', 'déplacer', 'taxi', 'uber', 'moto-taxi',
    'déménagement', 'coursier', 'expédition', 'logistique',

    // Services professionnels
    'consulting', 'conseil', 'aide', 'assistance', 'avocat', 'comptable',
    'marketing', 'design', 'développement', 'programmation', 'rédaction',

    // Santé & Beauté
    'coiffure', 'coiffer', 'massage', 'beauté', 'esthétique', 'médecin',
    'dentiste', 'pharmacie', 'thérapie', 'kinésithérapeute', 'soins',

    // Événements & Divertissement
    'événement', 'mariage', 'fête', 'animation', 'musique', 'photographe',
    'vidéaste', 'traiteur', 'décoration', 'spectacle', 'dj',

    // Autres services
    'service', 'prestation', 'travail', 'job', 'emploi', 'freelance'
  ]

  const productKeywords = [
    // Commerce général
    'vendre', 'vente', 'acheter', 'achat', 'prix', 'marché', 'commerce', 'boutique',
    'magasin', 'produit', 'article', 'objet', 'chose', 'item',

    // Électronique & Tech
    'téléphone', 'iphone', 'samsung', 'smartphone', 'ordinateur', 'laptop',
    'tablette', 'ipad', 'console', 'playstation', 'xbox', 'télévision', 'tv',
    'caméra', 'appareil', 'électronique', 'gadget',

    // Véhicules
    'voiture', 'moto', 'véhicule', 'auto', 'scooter', 'bicycle', 'vélo',
    'camion', 'bus', 'bateau', 'avion', 'pièces', 'accessoire',

    // Immobilier
    'maison', 'appartement', 'studio', 'villa', 'terrain', 'bureau',
    'local', 'commerce', 'immeuble', 'propriété', 'location', 'louer',

    // Mobilier & Décoration
    'meuble', 'table', 'chaise', 'lit', 'armoire', 'canapé', 'fauteuil',
    'décoration', 'lampe', 'miroir', 'tapis', 'rideau', 'art',

    // Mode & Accessoires
    'vêtement', 'habit', 'chaussure', 'sac', 'montre', 'bijou',
    'parfum', 'lunettes', 'chapeau', 'ceinture', 'mode', 'fashion',

    // Alimentation
    'nourriture', 'alimentaire', 'boisson', 'restaurant', 'café',
    'épicerie', 'fruits', 'légumes', 'viande', 'poisson',

    // Livres & Éducation
    'livre', 'cahier', 'stylo', 'fourniture', 'manuel', 'magazine',
    'journal', 'papeterie', 'bureau', 'scolaire',

    // Sports & Loisirs
    'sport', 'fitness', 'gym', 'jeu', 'jouet', 'hobby', 'loisir',
    'instrument', 'musique', 'guitare', 'piano',

    // Santé & Beauté (produits)
    'médicament', 'cosmétique', 'crème', 'shampoing', 'savon',
    'vitamine', 'supplément', 'équipement', 'médical'
  ]

  // Détection du type
  const isService = serviceKeywords.some(keyword => query.includes(keyword))
  const isProduct = productKeywords.some(keyword => query.includes(keyword))

  const type = isProduct && !isService ? "PRODUCT" : "SERVICE"

  // Détection de la catégorie avec logique GÉNÉRIQUE améliorée
  let category = "general"

  // Éducation & Formation
  if (query.match(/(cours|formation|prof|math|enseign|apprendre|éducation|école|étude|tuteur|coaching|stage|apprentissage|certification|diplôme)/)) {
    category = "education"
  }
  // Services techniques & Réparation
  else if (query.match(/(répar|dépann|plombier|électricien|fixer|maintenance|installation|technicien|ingénieur|mécanicien)/)) {
    category = "reparation"
  }
  // Services domestiques
  else if (query.match(/(ménage|nettoy|femme de ménage|lessive|repassage|jardinage|jardinier|sécurité|gardien|baby-sitting|garde)/)) {
    category = "domestique"
  }
  // Transport & Livraison
  else if (query.match(/(livraison|livrer|transport|déplacer|taxi|uber|moto-taxi|déménagement|coursier|expédition|logistique)/)) {
    category = "transport"
  }
  // Services professionnels
  else if (query.match(/(consulting|conseil|aide|assistance|avocat|comptable|marketing|design|développement|programmation|rédaction)/)) {
    category = "consulting"
  }
  // Santé & Beauté (services)
  else if (query.match(/(coiffure|coiffer|massage|beauté|esthétique|médecin|dentiste|thérapie|kinésithérapeute|soins)/)) {
    category = "sante-beaute"
  }
  // Événements & Divertissement
  else if (query.match(/(événement|mariage|fête|animation|musique|photographe|vidéaste|traiteur|décoration|spectacle|dj)/)) {
    category = "evenements"
  }

  // PRODUITS
  // Électronique & Technologie
  else if (query.match(/(téléphone|iphone|ordinateur|smartphone|samsung|tech|laptop|tablette|ipad|console|playstation|xbox|télévision|tv|caméra|appareil|électronique|gadget)/)) {
    category = "technologie"
  }
  // Véhicules
  else if (query.match(/(voiture|moto|véhicule|auto|scooter|bicycle|vélo|camion|bus|bateau|avion)/)) {
    category = "vehicules"
  }
  // Immobilier
  else if (query.match(/(maison|appartement|studio|villa|terrain|bureau|local|commerce|immeuble|propriété|location|louer)/)) {
    category = "immobilier"
  }
  // Mobilier & Décoration
  else if (query.match(/(meuble|table|chaise|lit|armoire|canapé|fauteuil|décoration|lampe|miroir|tapis|rideau|art)/)) {
    category = "mobilier"
  }
  // Mode & Accessoires
  else if (query.match(/(vêtement|habit|chaussure|sac|montre|bijou|parfum|lunettes|chapeau|ceinture|mode|fashion)/)) {
    category = "mode"
  }
  // Alimentation
  else if (query.match(/(nourriture|alimentaire|boisson|restaurant|café|épicerie|fruits|légumes|viande|poisson)/)) {
    category = "alimentation"
  }
  // Livres & Fournitures
  else if (query.match(/(livre|cahier|stylo|fourniture|manuel|magazine|journal|papeterie|bureau|scolaire)/)) {
    category = "librairie"
  }
  // Sports & Loisirs
  else if (query.match(/(sport|fitness|gym|jeu|jouet|hobby|loisir|instrument|musique|guitare|piano)/)) {
    category = "sports-loisirs"
  }
  // Santé & Beauté (produits)
  else if (query.match(/(médicament|cosmétique|crème|shampoing|savon|vitamine|supplément|équipement médical)/)) {
    category = "sante-beaute-produits"
  }

  // Détection intelligente de localisation avec base géographique africaine
  let location: string | null = null

  // Chercher d'abord les mots clés géographiques dans la requête prétraitée
  const queryWords = preprocessedQuery.split(' ')
  for (const word of queryWords) {
    const foundLocation = findLocation(word)
    if (foundLocation) {
      // Si c'est un quartier, prendre la ville parent
      const mainCity = getMainCity(word)
      location = mainCity ? mainCity.name : foundLocation.name
      break
    }
  }

  // Si pas trouvé, essayer des phrases complètes
  if (!location) {
    // Rechercher des patterns comme "à [ville]", "dans [ville]", "de [ville]"
    const locationPatterns = [
      /(?:à|dans|de|sur|vers|chez)\s+([a-záàâäéèêëíìîïóòôöúùûü\-\s]+)/gi,
      /([a-záàâäéèêëíìîïóòôöúùûü\-\s]+)\s+(?:city|ville)/gi
    ]

    for (const pattern of locationPatterns) {
      const matches = preprocessedQuery.match(pattern)
      if (matches) {
        for (const match of matches) {
          const locationName = match.replace(/(?:à|dans|de|sur|vers|chez)\s+/gi, '').trim()
          const foundLocation = findLocation(locationName)
          if (foundLocation) {
            const mainCity = getMainCity(locationName)
            location = mainCity ? mainCity.name : foundLocation.name
            break
          }
        }
        if (location) break
      }
    }
  }

  // Construction de la description intelligente GÉNÉRIQUE
  let description = userQuery
  let searchIntent = userQuery

  // Descriptions spécialisées basées sur les catégories détectées
  switch (category) {
    case "education":
      if (query.includes('math')) {
        description = "cours de mathématiques et formation en maths"
        searchIntent = "je cherche des cours de mathématiques"
      } else if (query.includes('français')) {
        description = "cours de français et formation en langue française"
        searchIntent = "je cherche des cours de français"
      } else if (query.includes('anglais')) {
        description = "cours d'anglais et formation en langue anglaise"
        searchIntent = "je cherche des cours d'anglais"
      } else {
        description = "services d'éducation, formation et enseignement"
        searchIntent = "je cherche des services d'éducation et formation"
      }
      break

    case "reparation":
      description = "services de réparation, dépannage et maintenance"
      searchIntent = "je cherche des services de réparation"
      break

    case "domestique":
      description = "services domestiques (ménage, nettoyage, jardinage, garde)"
      searchIntent = "je cherche des services domestiques"
      break

    case "transport":
      description = "services de transport, livraison et déplacement"
      searchIntent = "je cherche des services de transport"
      break

    case "consulting":
      description = "services professionnels et de consulting"
      searchIntent = "je cherche des services professionnels"
      break

    case "sante-beaute":
      description = "services de santé, beauté et bien-être"
      searchIntent = "je cherche des services de santé et beauté"
      break

    case "evenements":
      description = "services d'événements et divertissement"
      searchIntent = "je cherche des services d'événements"
      break

    case "technologie":
      description = "produits électroniques et technologiques"
      searchIntent = "je cherche des produits technologiques"
      break

    case "vehicules":
      description = "véhicules et moyens de transport"
      searchIntent = "je cherche des véhicules"
      break

    case "immobilier":
      description = "biens immobiliers et propriétés"
      searchIntent = "je cherche des biens immobiliers"
      break

    case "mobilier":
      description = "mobilier et décoration"
      searchIntent = "je cherche du mobilier"
      break

    case "mode":
      description = "vêtements, mode et accessoires"
      searchIntent = "je cherche des articles de mode"
      break

    case "alimentation":
      description = "produits alimentaires et boissons"
      searchIntent = "je cherche des produits alimentaires"
      break

    case "librairie":
      description = "livres, fournitures et papeterie"
      searchIntent = "je cherche des livres ou fournitures"
      break

    case "sports-loisirs":
      description = "équipements de sport et loisirs"
      searchIntent = "je cherche des articles de sport"
      break

    case "sante-beaute-produits":
      description = "produits de santé et cosmétiques"
      searchIntent = "je cherche des produits de santé/beauté"
      break

    default:
      // Fallback générique intelligent
      if (type === "SERVICE") {
        description = `services liés à: ${userQuery}`
        searchIntent = `je cherche des services pour: ${userQuery}`
      } else {
        description = `produits liés à: ${userQuery}`
        searchIntent = `je cherche des produits pour: ${userQuery}`
      }
  }

  // Extraction des mots-clés pertinents depuis la requête prétraitée
  const words = preprocessedQuery.split(' ').filter(word =>
    word.length > 2 &&
    !['je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais', 'donc', 'car', 'dans', 'sur', 'avec', 'pour', 'par', 'sans', 'sous', 'chez', 'cherche', 'besoin', 'veux', 'voudrais', 'formation', 'enseignement', 'auto-école', 'permis', 'automobile', 'voiture'].includes(word)
  )

  return {
    elements: [{
      type,
      category,
      keywords: words,
      description,
      filters: {
        priceRange: { min: null, max: null },
        location,
        specificRequirements: []
      }
    }],
    searchIntent,
    elasticsearchQueries: [{
      query: words.join(" "),
      filters: { type, category }
    }]
  }
}

// Preprocesseur pour améliorer la requête - VERSION GÉNÉRIQUE
function preprocessQuery(query: string): string {
  let processed = query.toLowerCase().trim()

  // Normalisation des synonymes courants - COMPLET
  const synonyms: Record<string, string> = {
    // Éducation
    'maths': 'mathématiques',
    'math': 'mathématiques',
    'anglais': 'anglais langue',
    'français': 'français langue',
    'prof': 'professeur',
    'cours': 'cours formation enseignement',
    'formations': 'formation',
    'enseignement': 'cours formation',

    // Transport
    'auto': 'automobile voiture',
    'voiture': 'automobile voiture auto',
    'moto': 'moto-taxi motocyclette',
    'taxi': 'transport taxi moto-taxi',
    'conduite': 'conduite auto-école permis',

    // Technologie
    'ordi': 'ordinateur',
    'tel': 'téléphone',
    'smartphone': 'téléphone portable mobile',
    'laptop': 'ordinateur portable',
    'pc': 'ordinateur',

    // Immobilier
    'appart': 'appartement',
    'apart': 'appartement',
    'maison': 'maison villa habitat',
    'studio': 'studio appartement',

    // Général
    'réparation': 'réparation dépannage maintenance',
    'réparer': 'réparer dépanner fixer',
    'acheter': 'acheter achat vente',
    'vendre': 'vendre vente commerce',
    'service': 'service prestation travail',
    'produit': 'produit article objet',

    // Orthographe alternative communes
    'treichvil': 'treichville',
    'abidjan': 'abidjan treichville cocody yopougon',
    'dakar': 'dakar plateau almadies'
  }

  // Remplacement des synonymes avec logique améliorée
  Object.entries(synonyms).forEach(([key, value]) => {
    const regex = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    processed = processed.replace(regex, value)
  })

  // Ajout de contexte intelligent pour les requêtes courtes
  if (processed.includes('mathématiques') && !processed.includes('cours')) {
    processed += ' cours formation enseignement'
  }
  if (processed.includes('conduite') && !processed.includes('auto')) {
    processed += ' automobile voiture permis'
  }
  if (processed.includes('réparation') && !processed.includes('service')) {
    processed += ' service dépannage'
  }

  return processed
}

// Fonction principale d'analyse
export async function analyzeNaturalLanguageSearch(
  userQuery: string
): Promise<SearchAnalysisResult> {
  try {
    console.log(`🔍 Analyse de la recherche: "${userQuery}"`)

    // Prétraitement de la requête
    const preprocessedQuery = preprocessQuery(userQuery)
    console.log(`🔧 Requête prétraitée: "${preprocessedQuery}"`)

    const result = await searchAnalysisChain.invoke({
      userQuery: preprocessedQuery
    })

    // Parse le JSON retourné par l'IA
    const analysisResult = JSON.parse(result) as SearchAnalysisResult

    console.log("✅ Analyse terminée:", {
      elements: analysisResult.elements.length,
      queries: analysisResult.elasticsearchQueries.length
    })

    return analysisResult
  } catch (error) {
    console.error("❌ Erreur lors de l'analyse LangChain:", error)

    // Fallback intelligent en cas d'erreur IA
    const intelligentFallback = createIntelligentFallback(userQuery)
    return intelligentFallback
  }
}

// Mapping GÉNÉRIQUE des catégories IA vers les slugs de la DB
const categoryMapping: Record<string, string> = {
  // Services
  "education": "education-formation",
  "reparation": "services-techniques",
  "domestique": "services-domicile",
  "transport": "transport-livraison",
  "consulting": "services-professionnels",
  "sante-beaute": "sante-beaute-services",
  "evenements": "evenements-loisirs",

  // Produits
  "technologie": "electronique-informatique",
  "vehicules": "vehicules-transport",
  "immobilier": "immobilier-habitat",
  "mobilier": "mobilier-decoration",
  "mode": "mode-accessoires",
  "alimentation": "alimentation-boissons",
  "librairie": "livres-papeterie",
  "sports-loisirs": "sports-hobbies",
  "sante-beaute-produits": "sante-beaute-produits",

  // Fallback générique
  "general": "general"
}

// Fonction pour optimiser les requêtes Elasticsearch
// Fonction pour créer des requêtes géographiques par proximité
export function buildGeoQuery(
  location: string,
  distance: string = "10km",
  element?: Partial<SearchElement>,
  index: string = process.env.ELASTICSEARCH_INDEX || "marketplace_listings"
) {
  // Utiliser la base géographique africaine complète
  const foundLocation = findLocation(location)
  if (!foundLocation) return null

  // Si c'est un quartier, utiliser les coordonnées de la ville parent
  const targetLocation = getMainCity(location) || foundLocation
  const coords = targetLocation.coordinates

  const baseQuery: any = {
    index,
    query: {
      bool: {
        must: [
          {
            geo_distance: {
              distance,
              geoLocation: coords
            }
          }
        ],
        filter: [
          { term: { status: "ACTIVE" } }
        ]
      }
    },
    sort: [
      {
        _geo_distance: {
          geoLocation: coords,
          order: "asc",
          unit: "km"
        }
      },
      { "user.score": { order: "desc" } },
      "_score"
    ],
    size: 20
  }

  // Ajouter des filtres optionnels
  if (element?.type) {
    baseQuery.query.bool.filter.push({ term: { type: element.type } })
  }

  if (element?.keywords && element.keywords.length > 0) {
    baseQuery.query.bool.must.push({
      multi_match: {
        query: element.keywords.join(" "),
        fields: ["title^3", "description^2", "tags"],
        type: "best_fields",
        fuzziness: "AUTO"
      }
    })
  }

  return baseQuery
}

export function buildElasticsearchQuery(
  element: SearchElement,
  index: string = process.env.ELASTICSEARCH_INDEX || "marketplace_listings",
  fallbackLevel: number = 0
) {
  const { type, category, keywords, filters } = element

  // Mapper la catégorie IA vers le slug DB
  const categorySlug = categoryMapping[category] || category

  console.log(`🔧 Construction requête ES (niveau ${fallbackLevel}):`, {
    category,
    categorySlug,
    keywords,
    type,
    location: filters.location
  })

  // Construction de la requête de base avec plus de flexibilité
  const baseQuery: any = {
    index,
    query: {
      bool: {
        should: [
          // Recherche exacte boostée
          {
            multi_match: {
              query: keywords.join(" "),
              fields: ["title^4", "description^3", "tags^2"],
              type: "best_fields",
              fuzziness: "AUTO",
              boost: 3.0
            }
          },
          // Recherche avec phrase prefix
          {
            multi_match: {
              query: keywords.join(" "),
              fields: ["title^3", "description^2", "tags"],
              type: "phrase_prefix",
              boost: 2.0
            }
          },
          // Recherche cross-fields flexible
          {
            multi_match: {
              query: keywords.join(" "),
              fields: ["title^2", "description", "tags"],
              type: "cross_fields",
              operator: "or",
              boost: 1.5
            }
          },
          // Recherche par mots-clés individuels
          ...keywords.map(keyword => ({
            multi_match: {
              query: keyword,
              fields: ["title^2", "description", "tags"],
              fuzziness: "AUTO",
              boost: 1.0
            }
          }))
        ],
        minimum_should_match: fallbackLevel === 0 ? "75%" : fallbackLevel === 1 ? "50%" : 1,
        filter: [
          { term: { status: "ACTIVE" } }
        ]
      }
    },
    sort: [
      { "user.score": { order: "desc" } },
      { createdAt: { order: "desc" } },
      "_score"
    ],
    size: 20,
    highlight: {
      fields: {
        title: {},
        description: {},
        tags: {}
      }
    }
  }

  // Filtres conditionnels selon le niveau de fallback
  if (fallbackLevel === 0) {
    // Niveau 0: Filtres stricts
    baseQuery.query.bool.filter.push({ term: { type: type } })
    if (category !== "general") {
      baseQuery.query.bool.filter.push({ term: { "category.slug": categorySlug } })
    }
  } else if (fallbackLevel === 1) {
    // Niveau 1: Type uniquement
    baseQuery.query.bool.filter.push({ term: { type: type } })
  }
  // Niveau 2: Aucun filtre de type/catégorie

  // Gestion de la géolocalisation améliorée
  if (filters.location) {
    const locationQueries = [
      // Recherche exacte sur ville
      {
        term: {
          "city.keyword": {
            value: filters.location,
            boost: 4.0
          }
        }
      },
      // Recherche approximative sur ville
      {
        match: {
          city: {
            query: filters.location,
            fuzziness: "AUTO",
            boost: 3.0
          }
        }
      },
      // Recherche dans l'adresse complète
      {
        match: {
          address: {
            query: filters.location,
            fuzziness: "AUTO",
            boost: 2.0
          }
        }
      },
      // Recherche dans location (champ libre)
      {
        match: {
          location: {
            query: filters.location,
            fuzziness: "AUTO",
            boost: 2.5
          }
        }
      },
      // Recherche wildcard flexible
      {
        wildcard: {
          "address.keyword": {
            value: `*${filters.location.toLowerCase()}*`,
            boost: 1.5
          }
        }
      },
      {
        wildcard: {
          "city.keyword": {
            value: `*${filters.location.toLowerCase()}*`,
            boost: 2.0
          }
        }
      }
    ]

    if (fallbackLevel <= 1) {
      // Niveaux 0-1: Localisation obligatoire
      baseQuery.query.bool.filter.push({
        bool: {
          should: locationQueries,
          minimum_should_match: 1
        }
      })
    } else {
      // Niveau 2: Localisation optionnelle (boost seulement)
      baseQuery.query.bool.should.push({
        bool: {
          should: locationQueries,
          boost: 2.0
        }
      })
    }
  }

  // Filtres de prix
  if (filters.priceRange.min || filters.priceRange.max) {
    baseQuery.query.bool.filter.push({
      range: {
        price: {
          ...(filters.priceRange.min && { gte: filters.priceRange.min }),
          ...(filters.priceRange.max && { lte: filters.priceRange.max })
        }
      }
    })
  }

  return baseQuery
}