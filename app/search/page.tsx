"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useQueryState, parseAsString, parseAsStringEnum } from "nuqs"
import { Search, ArrowLeft, Plus, MapPin, Heart, Star, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ItemCard from "@/components/ui/item-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchResult {
  id: string
  score: number
  source: {
    title: string
    description: string
    price: number
    currency: string
    type: string
    location: string
    address: string
    city: string
    images: string[]
    user: {
      id: string
      name: string
      score: number
      verified: boolean
    }
    category: {
      name: string
      slug: string
    }
    tags: string[]
    createdAt: string
  }
  highlight?: {
    title?: string[]
    description?: string[]
  }
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function SearchPage() {
  const router = useRouter()
  const { data: session } = useSession()

  // URL state management with nuqs
  const [searchQuery, setSearchQuery] = useQueryState('q', parseAsString.withDefault(''))
  const [sortBy, setSortBy] = useQueryState('sort', parseAsStringEnum(['relevance', 'price_asc', 'price_desc', 'date', 'rating']).withDefault('relevance'))
  const [filterType, setFilterType] = useQueryState('type', parseAsStringEnum(['all', 'service', 'product']).withDefault('all'))

  // Local state for search results and UI
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  // Local input state for immediate UI updates
  const [inputValue, setInputValue] = useState(searchQuery)
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // Debounce the search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(inputValue, 500)

  // Update URL when debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setSearchQuery(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, searchQuery, setSearchQuery])

  // Sync input with URL state on mount
  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  // Perform search when searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery)
    }
  }, [searchQuery])

  // Gestion de la touche Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && inputValue) {
        clearSearch()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [inputValue])

  const performSearch = async (query: string) => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/search/natural', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data.results || [])
        setTotal(data.total || 0)
        setAiAnalysis(data.analysis || null)
      } else {
        console.error('Erreur de recherche:', data.error)
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim())
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  const clearSearch = () => {
    setInputValue('')
    setSearchQuery('')
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' ' + currency
  }

  const filteredResults = results.filter(result => {
    if (filterType === "all") return true
    return result.source.type === filterType.toUpperCase()
  })

  const sortedResults = [...filteredResults].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.source.price - b.source.price
      case "price_desc":
        return b.source.price - a.source.price
      case "date":
        return new Date(b.source.createdAt).getTime() - new Date(a.source.createdAt).getTime()
      case "rating":
        return b.source.user.score - a.source.user.score
      default:
        return b.score - a.score
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header minimaliste avec navigation complète */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          {/* Logo avec bouton retour */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-medium text-gray-700">Agora</h1>
            </Link>
          </div>

          {/* Barre de recherche au centre - Style Google */}
          <div className="flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch}>
              <div className={`relative bg-white rounded-full border-2 transition-all duration-200 ${
                isSearchFocused ? 'border-blue-500 shadow-xl' : 'border-gray-200'
              }`}>
                <Input
                  type="text"
                  placeholder="Décrivez exactement ce que vous cherchez..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  disabled={loading}
                  className="w-full pl-6 pr-24 h-12 text-base border-0 rounded-full focus:ring-0 focus:outline-none bg-transparent"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  {inputValue.trim() && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      title="Effacer la recherche (Esc)"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <MapPin className="text-gray-400 w-5 h-5 cursor-pointer hover:text-blue-500 transition-colors" />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || loading}
                    className="bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-full px-4 py-2 transition-colors"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Navigation droite */}
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                {/* Publier une annonce */}
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center space-x-2"
                  asChild
                >
                  <Link href="/create-listing">
                    <Plus className="w-4 h-4" />
                    <span>Publier un service ou un bien</span>
                  </Link>
                </Button>

                {/* Menu utilisateur */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={session.user.avatar || ""} />
                        <AvatarFallback className="bg-blue-500 text-white text-sm">
                          {(() => {
                            const firstName = session.user.firstName || ""
                            const lastName = session.user.lastName || ""
                            const name = session.user.name || ""

                            if (firstName && lastName) {
                              return firstName[0] + lastName[0]
                            } else if (name) {
                              return name.split(' ').map(n => n[0]).join('').substring(0, 2)
                            } else {
                              return "U"
                            }
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium">
                          {session.user.firstName && session.user.lastName
                            ? `${session.user.firstName} ${session.user.lastName}`
                            : session.user.name || "Utilisateur"
                          }
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500">Score: {session.user.score.toFixed(1)}/5</p>
                          {session.user.verified && (
                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">✓</span>
                          )}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Mon profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-listings">Mes annonces</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages">Messages</Link>
                    </DropdownMenuItem>
                    {!session.user.verified && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/verification" className="text-blue-600">
                            <span>Vérifier mon identité</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {session.user.isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard" className="text-purple-600">
                            <span>Tableau de bord Admin</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="sm:hidden" asChild>
                      <Link href="/create-listing">
                        <Plus className="w-4 h-4 mr-2" />
                        Publier une annonce
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="sm:hidden" />
                    <DropdownMenuItem asChild>
                      <Link href="/settings">Paramètres</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 cursor-pointer"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Se connecter</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register">S'inscrire</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* AI Analysis Response */}
        {aiAnalysis && searchQuery && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🤖</span>
                </div>
              </div>
              <div className="flex-1">
              

                {aiAnalysis.elements && aiAnalysis.elements.length > 0 && (
                  <div>
                    <p className="text-sm text-blue-800 mb-2">
                      <span className="font-medium">J'ai recherché :</span>
                    </p>
                    <div className="space-y-2">
                      {aiAnalysis.elements.map((element: any, index: number) => (
                        <div key={index} className="bg-white rounded-md p-3 border border-blue-200">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge
                              variant={element.type === 'SERVICE' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {element.type === 'SERVICE' ? '🔧 Service' : '📦 Produit'}
                            </Badge>
                            {element.category !== 'general' && (
                              <Badge variant="outline" className="text-xs">
                                {element.category}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
                            "{element.description}"
                          </p>
                          {element.keywords && element.keywords.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {element.keywords.slice(0, 5).map((keyword: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results header & filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Résultats de recherche
            </h1>
            <p className="text-gray-600">
              {total} résultat{total > 1 ? 's' : ''} pour "{searchQuery}"
            </p>
          </div>

          <div className="flex gap-3">
            <Select value={filterType} onValueChange={(value) => setFilterType(value as "all" | "service" | "product")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="product">Produits</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as "relevance" | "price_asc" | "price_desc" | "date" | "rating")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Pertinence</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="date">Plus récent</SelectItem>
                <SelectItem value="rating">Mieux notés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedResults.map((result) => (
              <ItemCard
                key={result.id}
                id={result.id}
                title={result.source.title}
                type={result.source.type as "PRODUCT" | "SERVICE"}
                price={result.source.price}
                currency={result.source.currency}
                imageSrc={result.source.images?.[0]}
                imageAlt={result.source.title}
                description={result.source.description}
                location={result.source.location}
                tags={result.source.tags}
                user={result.source.user}
                highlight={result.highlight}
                onContact={(id) => {
                  console.log('Contact listing:', id);
                }}
                onToggleLike={(liked, id) => {
                  console.log('Toggle like:', liked, id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-600">
              Essayez avec d'autres mots-clés ou vérifiez l'orthographe
            </p>
          </div>
        )}
      </div>
    </div>
  )
}