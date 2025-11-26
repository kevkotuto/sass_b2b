"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Package,
  Wrench,
  Upload,
  X,
  MapPin,
  DollarSign,
  Tag,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2
} from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
}

export default function CreateListingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    currency: "CFA",
    type: "SERVICE",
    categoryId: "",
    location: "",
    city: "",
    contact: "",
    tags: [] as string[]
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Les hooks doivent être appelés avant les conditions
  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    // Redirection si non connecté
    if (status === "loading") return

    if (!session?.user) {
      router.push("/auth/login")
    }
  }, [session, status, router])

  // Conditions de rendu après tous les hooks
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Chargement...</div>
    </div>
  }

  if (!session?.user) {
    return null
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data || [])
      }
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limite à 5 images
    const totalImages = images.length + files.length
    if (totalImages > 5) {
      setError("Vous ne pouvez ajouter que 5 images maximum")
      return
    }

    // Vérifier la taille des fichiers (max 5MB par image)
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Chaque image doit faire moins de 5MB")
        return
      }
    }

    setImages(prev => [...prev, ...files])

    // Créer les URLs de prévisualisation
    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))

    // Révoquer l'URL de prévisualisation pour éviter les fuites mémoire
    URL.revokeObjectURL(previewUrls[index])
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }))
    setNewTag("")
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error("Le titre est obligatoire")
      }
      if (!formData.description.trim()) {
        throw new Error("La description est obligatoire")
      }
      if (!formData.categoryId) {
        throw new Error("Veuillez sélectionner une catégorie")
      }

      // Upload des images d'abord si nécessaire
      let imageUrls: string[] = []
      if (images.length > 0) {
        const formDataImages = new FormData()
        images.forEach((image, index) => {
          formDataImages.append(`image_${index}`, image)
        })

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataImages
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || "Erreur lors de l'upload des images")
        }

        const uploadData = await uploadResponse.json()
        imageUrls = uploadData.urls || []
        console.log("Images uploadées avec succès:", imageUrls)
      }

      // Créer l'annonce
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: formData.price ? parseFloat(formData.price) : null,
          currency: formData.currency,
          type: formData.type,
          categoryId: formData.categoryId,
          location: formData.location.trim(),
          city: formData.city.trim(),
          contact: formData.contact.trim() || null,
          tags: formData.tags,
          images: imageUrls
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de l'annonce")
      }

      setSuccess("Annonce créée avec succès !")

      // Redirection après 2 secondes
      setTimeout(() => {
        router.push(`/listings/${data.id}`)
      }, 2000)

    } catch (error) {
      setError(error instanceof Error ? error.message : "Erreur lors de la création")
    } finally {
      setIsLoading(false)
    }
  }

  const currencyOptions = [
    { value: "CFA", label: "CFA (Franc CFA)" },
    { value: "EUR", label: "EUR (Euro)" },
    { value: "USD", label: "USD (Dollar US)" },
    { value: "XOF", label: "XOF (Franc CFA BCEAO)" },
    { value: "XAF", label: "XAF (Franc CFA BEAC)" },
    { value: "MAD", label: "MAD (Dirham marocain)" },
    { value: "TND", label: "TND (Dinar tunisien)" },
    { value: "DZD", label: "DZD (Dinar algérien)" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Plus className="w-6 h-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Créer une annonce</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type d'annonce */}
          <Card>
            <CardHeader>
              <CardTitle>Type d'annonce</CardTitle>
              <CardDescription>
                Que souhaitez-vous proposer ?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => handleInputChange("type", "SERVICE")}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.type === "SERVICE"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Wrench className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Service</h3>
                      <p className="text-sm text-gray-600">Offrir un service ou une compétence</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleInputChange("type", "PRODUCT")}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.type === "PRODUCT"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-medium">Produit</h3>
                      <p className="text-sm text-gray-600">Vendre un objet ou produit</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Décrivez votre {formData.type === "SERVICE" ? "service" : "produit"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de l'annonce *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder={`Ex: ${formData.type === "SERVICE" ? "Cours de guitare à domicile" : "iPhone 13 en excellent état"}`}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder={`Décrivez en détail votre ${formData.type === "SERVICE" ? "service" : "produit"}...`}
                  rows={4}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <Label htmlFor="categoryId">Catégorie *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Prix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Prix</span>
              </CardTitle>
              <CardDescription>
                Définissez le prix de votre {formData.type === "SERVICE" ? "service" : "produit"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Prix</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Laissez vide si le prix est à négocier
                  </p>
                </div>

                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Localisation</span>
              </CardTitle>
              <CardDescription>
                Où se trouve votre {formData.type === "SERVICE" ? "service" : "produit"} ?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Ex: Dakar, Thiès, Saint-Louis..."
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => handleInputChange("contact", e.target.value)}
                    placeholder="Numéro de téléphone ou autre"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Adresse complète (optionnel)</Label>
                <Textarea
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Adresse précise, quartier, points de repère..."
                  rows={2}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Images</span>
              </CardTitle>
              <CardDescription>
                Ajoutez des photos pour attirer l'attention (max 5 images, 5MB chacune)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isLoading || images.length >= 5}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Cliquez pour ajouter des images
                  </p>
                  <p className="text-sm text-gray-600">
                    PNG, JPG, JPEG jusqu'à 5MB chacune
                  </p>
                </label>
              </div>

              {/* Prévisualisation des images */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={url}
                          alt={`Image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>Mots-clés</span>
              </CardTitle>
              <CardDescription>
                Ajoutez des mots-clés pour faciliter la recherche
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Ajouter un mot-clé"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  disabled={isLoading}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Ajouter
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Boutons de soumission */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/">Annuler</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Création..." : "Publier l'annonce"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}