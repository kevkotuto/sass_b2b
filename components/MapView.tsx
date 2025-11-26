"use client"

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Import dynamique pour éviter les problèmes SSR avec Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

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

interface MapViewProps {
  listings: Listing[]
  center: [number, number]
  zoom?: number
  height?: string
  onMarkerClick?: (listing: Listing) => void
}

export default function MapView({
  listings,
  center,
  zoom = 12,
  height = "400px",
  onMarkerClick
}: MapViewProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div
        className="bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(listing)
                }
              }
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-semibold text-sm mb-2">{listing.title}</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <p><span className="font-medium">Prix:</span> {listing.price.toLocaleString()} {listing.currency}</p>
                  <p><span className="font-medium">Type:</span> {listing.type}</p>
                  <p><span className="font-medium">Distance:</span> {listing.distance}km</p>
                  <p><span className="font-medium">Vendeur:</span> {listing.user.firstName} {listing.user.lastName}
                    {listing.user.verified && <span className="text-green-600 ml-1">✓</span>}
                  </p>
                  <p><span className="font-medium">Catégorie:</span> {listing.category.name}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{listing.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}