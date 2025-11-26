"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Upload,
  FileText,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Camera,
  AlertTriangle
} from "lucide-react"
import { DocumentType, VerificationStatus } from "@/types/verification"

export default function VerificationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.NATIONAL_ID)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string>("")

  // Redirection si pas connecté
  if (status === "loading") {
    return <div>Chargement...</div>
  }

  if (!session) {
    router.push("/auth/login")
    return null
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError("")
    setSuccess("")

    if (!file) return

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError("Seuls les fichiers JPG, PNG, WEBP et PDF sont acceptés")
      return
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 10MB")
      return
    }

    setSelectedFile(file)

    // Créer un aperçu pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl("")
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier")
      return
    }

    setIsUploading(true)
    setError("")
    setSuccess("")

    try {
      const formData = new FormData()
      formData.append('document', selectedFile)
      formData.append('documentType', documentType)

      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'upload")
      } else {
        setSuccess("Document envoyé avec succès ! Il sera examiné par notre équipe dans les 24-48h.")
        setSelectedFile(null)
        setPreviewUrl("")
        // Redirection après 3 secondes
        setTimeout(() => {
          router.push("/profile")
        }, 3000)
      }
    } catch (error) {
      setError("Erreur lors de l'envoi du document")
    } finally {
      setIsUploading(false)
    }
  }

  const getVerificationStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.APPROVED:
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case VerificationStatus.PENDING:
        return <Clock className="w-5 h-5 text-yellow-500" />
      case VerificationStatus.SUBMITTED:
        return <Clock className="w-5 h-5 text-blue-500" />
      case VerificationStatus.REJECTED:
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  const getVerificationStatusText = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.APPROVED:
        return "Vérifié ✓"
      case VerificationStatus.PENDING:
        return "En attente de document"
      case VerificationStatus.SUBMITTED:
        return "Document en cours d'examen"
      case VerificationStatus.REJECTED:
        return "Document rejeté"
      default:
        return "Non vérifié"
    }
  }

  const currentStatus = session.user.verificationStatus

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vérification d'identité
          </h1>
          <p className="text-gray-600">
            Sécurisez votre compte et gagnez la confiance des autres utilisateurs
          </p>
        </div>

        {/* Statut actuel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getVerificationStatusIcon(currentStatus)}
              <span>Statut de vérification</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">
                {getVerificationStatusText(currentStatus)}
              </span>
              {session.user.verified && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Compte vérifié
                </div>
              )}
            </div>

            {currentStatus === VerificationStatus.SUBMITTED && (
              <Alert className="mt-4">
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Votre document est en cours d'examen. Vous recevrez une notification dès que la vérification sera terminée.
                </AlertDescription>
              </Alert>
            )}

            {currentStatus === VerificationStatus.REJECTED && (
              <Alert variant="destructive" className="mt-4">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Votre document a été rejeté. Veuillez soumettre un nouveau document de meilleure qualité.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Formulaire d'upload */}
        {(currentStatus === VerificationStatus.PENDING || currentStatus === VerificationStatus.REJECTED) && (
          <Card>
            <CardHeader>
              <CardTitle>Télécharger votre pièce d'identité</CardTitle>
              <CardDescription>
                Soumettez un document officiel pour vérifier votre identité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="documentType">Type de document</Label>
                <Select
                  value={documentType}
                  onValueChange={(value: DocumentType) => setDocumentType(value)}
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type de document" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DocumentType.NATIONAL_ID}>Carte d'identité nationale</SelectItem>
                    <SelectItem value={DocumentType.PASSPORT}>Passeport</SelectItem>
                    <SelectItem value={DocumentType.DRIVING_LICENSE}>Permis de conduire</SelectItem>
                    <SelectItem value={DocumentType.OTHER}>Autre document officiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Zone de drop */}
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      {previewUrl ? (
                        <div className="relative w-48 h-32 mx-auto">
                          <Image
                            src={previewUrl}
                            alt="Aperçu du document"
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                      ) : (
                        <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Changer de fichier
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Cliquez pour sélectionner un fichier
                        </p>
                        <p className="text-sm text-gray-500">
                          JPG, PNG, WEBP ou PDF jusqu'à 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conseils */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Conseils pour une bonne photo
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Assurez-vous que le document est lisible et complet</li>
                  <li>• Évitez les reflets et les zones floues</li>
                  <li>• Prenez la photo dans un endroit bien éclairé</li>
                  <li>• Le document doit être valide et non expiré</li>
                </ul>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? "Envoi en cours..." : "Envoyer le document"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Avantages de la vérification */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pourquoi vérifier votre identité ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <p className="font-medium">Augmentez votre crédibilité</p>
                  <p className="text-sm text-gray-600">Les utilisateurs vérifiés inspirent plus confiance</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Sécurisez votre compte</p>
                  <p className="text-sm text-gray-600">Protection renforcée contre les fraudes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                <div>
                  <p className="font-medium">Accès prioritaire</p>
                  <p className="text-sm text-gray-600">Profitez de fonctionnalités exclusives</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">Badge de confiance</p>
                  <p className="text-sm text-gray-600">Affichez votre statut vérifié sur votre profil</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}