"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Clock,
  DollarSign,
  Package,
  Wrench,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"

interface Listing {
  id: string
  title: string
  description: string
  price?: number
  currency: string
  type: "PRODUCT" | "SERVICE"
  status: "ACTIVE" | "INACTIVE" | "SOLD" | "EXPIRED"
  images: string[]
  location?: string
  city?: string
  createdAt: string
  updatedAt: string
  category: {
    name: string
    icon?: string
  }
}

export default function MyListingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)

  // Redirection si non connecté
  if (status === "loading") {
    return <div>Chargement...</div>
  }

  if (!session?.user) {
    router.push("/auth/login")
    return null
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/listings/my-listings")

      if (response.ok) {
        const data = await response.json()
        setListings(data.listings || [])
      } else {
        setError("Erreur lors du chargement des annonces")
      }
    } catch (error) {
      setError("Erreur lors du chargement des annonces")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setListings(listings.filter(l => l.id !== listingId))
        setDeleteDialogOpen(false)
        setSelectedListing(null)
      } else {
        setError("Erreur lors de la suppression")
      }
    } catch (error) {
      setError("Erreur lors de la suppression")
    }
  }

  const toggleListingStatus = async (listingId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"

      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setListings(listings.map(l =>
          l.id === listingId ? { ...l, status: newStatus as any } : l
        ))
      } else {
        setError("Erreur lors du changement de statut")
      }
    } catch (error) {
      setError("Erreur lors du changement de statut")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Actif</Badge>
      case "INACTIVE":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Inactif</Badge>
      case "SOLD":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" /> Vendu</Badge>
      case "EXPIRED":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Expiré</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "PRODUCT" ? <Package className="w-4 h-4" /> : <Wrench className="w-4 h-4" />
  }

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return "Prix non défini"

    const currencySymbols: Record<string, string> = {
      "CFA": "CFA",
      "EUR": "€",
      "USD": "$",
      "XOF": "CFA",
      "XAF": "CFA",
      "MAD": "MAD",
      "TND": "TND",
      "DZD": "DZD"
    }

    return `${price.toLocaleString()} ${currencySymbols[currency || "CFA"] || currency}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p>Chargement de vos annonces...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Package className="w-6 h-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Mes annonces</h1>
              </div>
            </div>
            <Button asChild>
              <Link href="/create-listing">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle annonce
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Actives</p>
                  <p className="text-2xl font-bold">{listings.filter(l => l.status === "ACTIVE").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Inactives</p>
                  <p className="text-2xl font-bold">{listings.filter(l => l.status === "INACTIVE").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Produits</p>
                  <p className="text-2xl font-bold">{listings.filter(l => l.type === "PRODUCT").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Services</p>
                  <p className="text-2xl font-bold">{listings.filter(l => l.type === "SERVICE").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des annonces */}
        {listings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune annonce</h3>
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore publié d'annonces. Commencez dès maintenant !
              </p>
              <Button asChild>
                <Link href="/create-listing">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer ma première annonce
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="relative">
                  {listing.images.length > 0 ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      {getTypeIcon(listing.type)}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    {getStatusBadge(listing.status)}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg line-clamp-2">{listing.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                        {getTypeIcon(listing.type)}
                        <span>{listing.category.name}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/listings/${listing.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/listings/${listing.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleListingStatus(listing.id, listing.status)}
                        >
                          {listing.status === "ACTIVE" ? (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Activer
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedListing(listing)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {listing.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">{formatPrice(listing.price, listing.currency)}</span>
                      </div>
                    </div>

                    {listing.location && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        Publié le {new Date(listing.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de confirmation de suppression */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer l'annonce</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>

            {selectedListing && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedListing.title}</p>
                  <p className="text-sm text-gray-600">{selectedListing.category.name}</p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteListing(selectedListing.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}