// Base de données géographique complète pour l'Afrique
// Extensible pour d'autres continents

export interface Location {
  name: string
  country: string
  coordinates: {
    lat: number
    lon: number
  }
  type: 'country' | 'capital' | 'city' | 'neighborhood' | 'region'
  population?: number
  aliases?: string[] // Noms alternatifs, abréviations
  parent?: string // Ville parent pour les quartiers
  subLocations?: string[] // Quartiers, arrondissements
}

// Base de données géographique africaine
export const AFRICAN_GEOGRAPHY: Record<string, Location> = {
  // ============== SÉNÉGAL ==============
  'senegal': {
    name: 'Sénégal',
    country: 'Sénégal',
    coordinates: { lat: 14.4974, lon: -14.4524 },
    type: 'country'
  },

  // Dakar et ses quartiers
  'dakar': {
    name: 'Dakar',
    country: 'Sénégal',
    coordinates: { lat: 14.6937, lon: -17.4441 },
    type: 'capital',
    population: 1146053,
    aliases: ['dkr'],
    subLocations: ['plateau', 'almadies', 'mermoz', 'point-e', 'sacre-coeur', 'fann', 'grand-dakar', 'medina', 'gueule-tapee']
  },
  'plateau': {
    name: 'Plateau',
    country: 'Sénégal',
    coordinates: { lat: 14.6937, lon: -17.4441 },
    type: 'neighborhood',
    parent: 'dakar'
  },
  'almadies': {
    name: 'Almadies',
    country: 'Sénégal',
    coordinates: { lat: 14.7392, lon: -17.5297 },
    type: 'neighborhood',
    parent: 'dakar',
    aliases: ['ngor']
  },
  'mermoz': {
    name: 'Mermoz',
    country: 'Sénégal',
    coordinates: { lat: 14.7169, lon: -17.4679 },
    type: 'neighborhood',
    parent: 'dakar'
  },
  'point-e': {
    name: 'Point E',
    country: 'Sénégal',
    coordinates: { lat: 14.7058, lon: -17.4647 },
    type: 'neighborhood',
    parent: 'dakar',
    aliases: ['point e']
  },
  'sacre-coeur': {
    name: 'Sacré-Cœur',
    country: 'Sénégal',
    coordinates: { lat: 14.7203, lon: -17.4672 },
    type: 'neighborhood',
    parent: 'dakar',
    aliases: ['sacré-cœur', 'sacre coeur']
  },
  'fann': {
    name: 'Fann',
    country: 'Sénégal',
    coordinates: { lat: 14.6890, lon: -17.4692 },
    type: 'neighborhood',
    parent: 'dakar'
  },
  'grand-dakar': {
    name: 'Grand Dakar',
    country: 'Sénégal',
    coordinates: { lat: 14.6928, lon: -17.4467 },
    type: 'neighborhood',
    parent: 'dakar'
  },
  'parcelles-assainies': {
    name: 'Parcelles Assainies',
    country: 'Sénégal',
    coordinates: { lat: 14.7644, lon: -17.4167 },
    type: 'neighborhood',
    parent: 'dakar',
    aliases: ['parcelles assainies', 'pa']
  },

  // Banlieue de Dakar
  'pikine': {
    name: 'Pikine',
    country: 'Sénégal',
    coordinates: { lat: 14.7549, lon: -17.3924 },
    type: 'city',
    population: 874062
  },
  'rufisque': {
    name: 'Rufisque',
    country: 'Sénégal',
    coordinates: { lat: 14.7167, lon: -17.2667 },
    type: 'city',
    population: 179797
  },
  'guediawaye': {
    name: 'Guédiawaye',
    country: 'Sénégal',
    coordinates: { lat: 14.7694, lon: -17.4178 },
    type: 'city',
    aliases: ['guédiawaye']
  },

  // Autres villes du Sénégal
  'thies': {
    name: 'Thiès',
    country: 'Sénégal',
    coordinates: { lat: 14.7897, lon: -16.9267 },
    type: 'city',
    population: 320000,
    aliases: ['thiès']
  },
  'saint-louis': {
    name: 'Saint-Louis',
    country: 'Sénégal',
    coordinates: { lat: 16.0190, lon: -16.4844 },
    type: 'city',
    population: 176000,
    aliases: ['saint louis']
  },
  'kaolack': {
    name: 'Kaolack',
    country: 'Sénégal',
    coordinates: { lat: 14.1521, lon: -16.0726 },
    type: 'city',
    population: 233708
  },
  'mbour': {
    name: 'Mbour',
    country: 'Sénégal',
    coordinates: { lat: 14.4198, lon: -16.9692 },
    type: 'city',
    population: 153503
  },
  'diourbel': {
    name: 'Diourbel',
    country: 'Sénégal',
    coordinates: { lat: 14.6522, lon: -16.2317 },
    type: 'city',
    population: 100445
  },
  'touba': {
    name: 'Touba',
    country: 'Sénégal',
    coordinates: { lat: 14.8500, lon: -15.8833 },
    type: 'city',
    population: 529176
  },

  // ============== CÔTE D'IVOIRE ==============
  'cote-divoire': {
    name: 'Côte d\'Ivoire',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 7.5400, lon: -5.5471 },
    type: 'country',
    aliases: ['côte d\'ivoire', 'ivory coast']
  },

  // Abidjan et ses communes
  'abidjan': {
    name: 'Abidjan',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.3600, lon: -4.0083 },
    type: 'capital',
    population: 4395243,
    aliases: ['abj'],
    subLocations: ['treichville', 'plateau', 'cocody', 'yopougon', 'adjame', 'marcory', 'koumassi', 'port-bouet', 'abobo', 'attecoube']
  },
  'treichville': {
    name: 'Treichville',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.2469, lon: -4.0232 },
    type: 'neighborhood',
    parent: 'abidjan'
  },
  'plateau-abidjan': {
    name: 'Plateau',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.3247, lon: -4.0082 },
    type: 'neighborhood',
    parent: 'abidjan',
    aliases: ['plateau abidjan']
  },
  'cocody': {
    name: 'Cocody',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.3444, lon: -3.9738 },
    type: 'neighborhood',
    parent: 'abidjan'
  },
  'yopougon': {
    name: 'Yopougon',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.3356, lon: -4.0778 },
    type: 'neighborhood',
    parent: 'abidjan'
  },
  'adjame': {
    name: 'Adjamé',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.3667, lon: -4.0167 },
    type: 'neighborhood',
    parent: 'abidjan',
    aliases: ['adjamé']
  },
  'marcory': {
    name: 'Marcory',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.2833, lon: -3.9833 },
    type: 'neighborhood',
    parent: 'abidjan'
  },
  'koumassi': {
    name: 'Koumassi',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.2833, lon: -3.9500 },
    type: 'neighborhood',
    parent: 'abidjan'
  },
  'port-bouet': {
    name: 'Port-Bouët',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.2500, lon: -3.9167 },
    type: 'neighborhood',
    parent: 'abidjan',
    aliases: ['port-bouët', 'port bouet']
  },
  'abobo': {
    name: 'Abobo',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.4167, lon: -4.0167 },
    type: 'neighborhood',
    parent: 'abidjan'
  },
  'attecoube': {
    name: 'Attécoubé',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 5.3500, lon: -4.0333 },
    type: 'neighborhood',
    parent: 'abidjan',
    aliases: ['attécoubé']
  },

  // Autres villes de Côte d'Ivoire
  'yamoussoukro': {
    name: 'Yamoussoukro',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 6.8276, lon: -5.2893 },
    type: 'capital', // Capitale politique
    population: 355573
  },
  'bouake': {
    name: 'Bouaké',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 7.6906, lon: -5.0300 },
    type: 'city',
    population: 536719,
    aliases: ['bouaké']
  },
  'daloa': {
    name: 'Daloa',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 6.8775, lon: -6.4503 },
    type: 'city',
    population: 245360
  },
  'san-pedro': {
    name: 'San-Pédro',
    country: 'Côte d\'Ivoire',
    coordinates: { lat: 4.7469, lon: -6.6364 },
    type: 'city',
    aliases: ['san-pédro', 'san pedro']
  },

  // ============== MALI ==============
  'mali': {
    name: 'Mali',
    country: 'Mali',
    coordinates: { lat: 17.5707, lon: -3.9962 },
    type: 'country'
  },
  'bamako': {
    name: 'Bamako',
    country: 'Mali',
    coordinates: { lat: 12.6392, lon: -8.0029 },
    type: 'capital',
    population: 1297281
  },
  'sikasso': {
    name: 'Sikasso',
    country: 'Mali',
    coordinates: { lat: 11.3167, lon: -5.6667 },
    type: 'city',
    population: 225753
  },

  // ============== BURKINA FASO ==============
  'burkina-faso': {
    name: 'Burkina Faso',
    country: 'Burkina Faso',
    coordinates: { lat: 12.2383, lon: -1.5616 },
    type: 'country',
    aliases: ['burkina faso']
  },
  'ouagadougou': {
    name: 'Ouagadougou',
    country: 'Burkina Faso',
    coordinates: { lat: 12.3714, lon: -1.5197 },
    type: 'capital',
    population: 1086505
  },
  'bobo-dioulasso': {
    name: 'Bobo-Dioulasso',
    country: 'Burkina Faso',
    coordinates: { lat: 11.1781, lon: -4.2917 },
    type: 'city',
    aliases: ['bobo-dioulasso', 'bobo dioulasso']
  },

  // ============== GUINÉE ==============
  'guinee': {
    name: 'Guinée',
    country: 'Guinée',
    coordinates: { lat: 9.9456, lon: -9.6966 },
    type: 'country',
    aliases: ['guinée']
  },
  'conakry': {
    name: 'Conakry',
    country: 'Guinée',
    coordinates: { lat: 9.6412, lon: -13.5784 },
    type: 'capital',
    population: 1660973
  },

  // ============== GHANA ==============
  'ghana': {
    name: 'Ghana',
    country: 'Ghana',
    coordinates: { lat: 7.9465, lon: -1.0232 },
    type: 'country'
  },
  'accra': {
    name: 'Accra',
    country: 'Ghana',
    coordinates: { lat: 5.6037, lon: -0.1870 },
    type: 'capital',
    population: 2277729
  },
  'kumasi': {
    name: 'Kumasi',
    country: 'Ghana',
    coordinates: { lat: 6.6885, lon: -1.6244 },
    type: 'city',
    population: 443981
  },

  // ============== NIGERIA ==============
  'nigeria': {
    name: 'Nigeria',
    country: 'Nigeria',
    coordinates: { lat: 9.0820, lon: 8.6753 },
    type: 'country'
  },
  'lagos': {
    name: 'Lagos',
    country: 'Nigeria',
    coordinates: { lat: 6.5244, lon: 3.3792 },
    type: 'city',
    population: 15388000 // Aire métropolitaine
  },
  'abuja': {
    name: 'Abuja',
    country: 'Nigeria',
    coordinates: { lat: 9.0765, lon: 7.3986 },
    type: 'capital',
    population: 3278000
  },
  'kano': {
    name: 'Kano',
    country: 'Nigeria',
    coordinates: { lat: 12.0022, lon: 8.5920 },
    type: 'city',
    population: 4103000
  },

  // ============== MAROC ==============
  'maroc': {
    name: 'Maroc',
    country: 'Maroc',
    coordinates: { lat: 31.7917, lon: -7.0926 },
    type: 'country',
    aliases: ['morocco']
  },
  'casablanca': {
    name: 'Casablanca',
    country: 'Maroc',
    coordinates: { lat: 33.5731, lon: -7.5898 },
    type: 'city',
    population: 3359818,
    aliases: ['casa']
  },
  'rabat': {
    name: 'Rabat',
    country: 'Maroc',
    coordinates: { lat: 34.0209, lon: -6.8416 },
    type: 'capital',
    population: 577827
  },
  'marrakech': {
    name: 'Marrakech',
    country: 'Maroc',
    coordinates: { lat: 31.6295, lon: -7.9811 },
    type: 'city',
    population: 928850,
    aliases: ['marrakesh']
  },
  'fes': {
    name: 'Fès',
    country: 'Maroc',
    coordinates: { lat: 34.0181, lon: -5.0078 },
    type: 'city',
    aliases: ['fès', 'fez']
  }

  // TODO: Ajouter plus de pays (Algérie, Tunisie, Égypte, Kenya, Afrique du Sud, etc.)
}

// Fonction pour chercher une localisation de manière intelligente
export function findLocation(query: string): Location | null {
  const normalizedQuery = query.toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[-']/g, ' ')
    .trim()

  // Recherche exacte
  let location = AFRICAN_GEOGRAPHY[normalizedQuery]
  if (location) return location

  // Recherche par alias
  for (const [key, loc] of Object.entries(AFRICAN_GEOGRAPHY)) {
    if (loc.aliases?.some(alias =>
      alias.toLowerCase().replace(/[-']/g, ' ') === normalizedQuery
    )) {
      return loc
    }
  }

  // Recherche partielle (contient)
  for (const [key, loc] of Object.entries(AFRICAN_GEOGRAPHY)) {
    if (key.includes(normalizedQuery) ||
        loc.name.toLowerCase().includes(normalizedQuery) ||
        loc.aliases?.some(alias => alias.toLowerCase().includes(normalizedQuery))) {
      return loc
    }
  }

  return null
}

// Fonction pour obtenir la ville principale d'un quartier
export function getMainCity(locationName: string): Location | null {
  const location = findLocation(locationName)
  if (!location) return null

  if (location.parent) {
    return findLocation(location.parent)
  }

  return location
}

// Fonction pour obtenir toutes les localisations d'un pays
export function getLocationsByCountry(country: string): Location[] {
  return Object.values(AFRICAN_GEOGRAPHY).filter(loc =>
    loc.country.toLowerCase() === country.toLowerCase()
  )
}

// Fonction pour obtenir les quartiers d'une ville
export function getNeighborhoods(cityName: string): Location[] {
  return Object.values(AFRICAN_GEOGRAPHY).filter(loc =>
    loc.parent?.toLowerCase() === cityName.toLowerCase()
  )
}