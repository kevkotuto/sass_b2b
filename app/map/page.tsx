"use client"

import { useState, useEffect } from 'react'
import { Search, MapPin, Filter, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import MapView from '@/components/MapView'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  type: string
  latitude: number
  longitude: number
  distance: number
  user: {
    firstName: string
    lastName: string
    verified: boolean
  }
  category: {
    name: string
  }
}

const categories = [
  { slug: '', name: 'Toutes les catégories' },
  { slug: 'services-domicile', name: 'Services à domicile' },
  { slug: 'education-formation', name: 'Éducation & Formation' },
  { slug: 'informatique-tech', name: 'Informatique & Tech' },
  { slug: 'beaute-bien-etre', name: 'Beauté & Bien-être' },
  { slug: 'transport-livraison', name: 'Transport & Livraison' },
  { slug: 'electronique', name: 'Électronique' },
  { slug: 'mode-vetements', name: 'Mode & Vêtements' },
  { slug: 'immobilier', name: 'Immobilier' }
]

const radiusOptions = [
  { value: 1, label: '1 km' },
  { value: 2, label: '2 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' }
]

export default function MapPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [radius, setRadius] = useState(10)
  const [userLocation, setUserLocation] = useState<[number, number]>([14.6937, -17.4441]) // Dakar par défaut
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  // Demander la géolocalisation de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
          // Effectuer une recherche automatique avec la position de l'utilisateur
          performSearch(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.log('Géolocalisation refusée, utilisation de Dakar par défaut')
          // Effectuer une recherche avec les coordonnées par défaut de Dakar
          performSearch(14.6937, -17.4441)
        }
      )
    } else {
      // Effectuer une recherche avec les coordonnées par défaut de Dakar
      performSearch(14.6937, -17.4441)
    }
  }, [])

  const performSearch = async (lat: number, lng: number, query?: string, category?: string, searchRadius?: number) => {
    setLoading(true)
    try {
      const response = await fetch('/api/search/proximity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          radius: searchRadius || radius,
          query: query || searchQuery || undefined,
          category: category || selectedCategory || undefined
        })
      })

      const data = await response.json()
      if (data.success) {
        setListings(data.listings)
      } else {
        console.error('Erreur de recherche:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    performSearch(userLocation[0], userLocation[1])
  }

  const handleMarkerClick = (listing: Listing) => {
    setSelectedListing(listing)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Carte des annonces</h1>

          {/* Outils de recherche */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Rechercher des services ou produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* Sélecteur de catégorie */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[200px] justify-between">
                  {categories.find(c => c.slug === selectedCategory)?.name || 'Toutes les catégories'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sélecteur de rayon */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[120px] justify-between">
                  {radius} km
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {radiusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => setRadius(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bouton de recherche */}
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>

          {/* Informations de recherche */}
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>Position: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}</span>
            </div>
            <Badge variant="secondary">
              {listings.length} annonce{listings.length !== 1 ? 's' : ''} trouvée{listings.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des annonces */}
          <div className="lg:col-span-1 space-y-4 max-h-[80vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Recherche en cours...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune annonce trouvée dans la zone</p>
              </div>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedListing?.id === listing.id ? 'border-blue-500 shadow-md' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedListing(listing)}
                >
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{listing.title}</h3>
                  <div className="space-y-1 text-xs text-gray-600 mb-2">
                    <p className="font-medium text-blue-600">{listing.price.toLocaleString()} {listing.currency}</p>
                    <p>{listing.distance}km • {listing.category.name}</p>
                    <p>{listing.user.firstName} {listing.user.lastName}
                      {listing.user.verified && <span className="text-green-600 ml-1">✓</span>}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{listing.description}</p>
                </div>
              ))
            )}
          </div>

          {/* Carte */}
          <div className="lg:col-span-2">
            <MapView
              listings={listings}
              center={userLocation}
              height="80vh"
              onMarkerClick={handleMarkerClick}
            />
          </div>
        </div>
      </div>
    </div>
  )
}