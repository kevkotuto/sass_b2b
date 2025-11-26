"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Shield,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  TrendingUp,
  Activity,
  Settings,
  LogOut
} from "lucide-react"
import { VerificationRequestWithUser, AdminStats, DocumentType, VerificationStatus } from "@/types/verification"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequestWithUser[]>([])
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequestWithUser | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  // Vérification admin et redirection
  if (status === "loading") {
    return <div>Chargement...</div>
  }

  if (!session?.user?.isAdmin) {
    router.push("/")
    return null
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)

      // Récupérer les stats et les demandes de vérification en parallèle
      const [statsRes, requestsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/verification-requests")
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setVerificationRequests(requestsData.data)
      }

    } catch (error) {
      setError("Erreur lors du chargement des données")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    await handleVerificationAction(requestId, "approve")
  }

  const handleReject = async (requestId: string) => {
    await handleVerificationAction(requestId, "reject")
  }

  const handleVerificationAction = async (requestId: string, action: "approve" | "reject") => {
    setIsProcessing(true)
    setError("")

    try {
      const response = await fetch("/api/admin/verification-action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requestId,
          action,
          adminNotes: adminNotes.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erreur lors du traitement")
      } else {
        // Actualiser les données
        await fetchData()
        setSelectedRequest(null)
        setAdminNotes("")
      }
    } catch (error) {
      setError("Erreur lors du traitement")
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.SUBMITTED:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>
      case VerificationStatus.APPROVED:
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Approuvé</Badge>
      case VerificationStatus.REJECTED:
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getDocumentTypeText = (type: DocumentType) => {
    switch (type) {
      case DocumentType.NATIONAL_ID:
        return "Carte d'identité"
      case DocumentType.PASSPORT:
        return "Passeport"
      case DocumentType.DRIVING_LICENSE:
        return "Permis de conduire"
      case DocumentType.OTHER:
        return "Autre"
      default:
        return "Inconnu"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Tableau de bord Admin</h1>
                <p className="text-sm text-gray-500">Agora - Administration</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir le site
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.verifiedUsers} vérifiés
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vérifications en attente</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
                <p className="text-xs text-muted-foreground">
                  À traiter
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Annonces</CardTitle>
                <FileText className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalListings}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeListings} actives
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de vérification</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Utilisateurs vérifiés
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Demandes de vérification */}
        <Card>
          <CardHeader>
            <CardTitle>Demandes de vérification</CardTitle>
            <CardDescription>
              Gérez les demandes de vérification d'identité des utilisateurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune demande de vérification</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type de document</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date de soumission</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {verificationRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {request.user.firstName && request.user.lastName
                              ? `${request.user.firstName} ${request.user.lastName}`
                              : request.user.name || "Nom non défini"
                            }
                          </p>
                          <p className="text-sm text-gray-500">{request.user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getDocumentTypeText(request.documentType)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {new Date(request.submittedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        {request.status === VerificationStatus.SUBMITTED && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request)
                                  setAdminNotes("")
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Examiner
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Vérification d'identité</DialogTitle>
                                <DialogDescription>
                                  Examinez le document et approuvez ou rejetez la demande
                                </DialogDescription>
                              </DialogHeader>

                              {selectedRequest && (
                                <div className="space-y-6">
                                  {/* Info utilisateur */}
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <Label>Utilisateur</Label>
                                      <p className="font-medium">
                                        {selectedRequest.user.firstName && selectedRequest.user.lastName
                                          ? `${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`
                                          : selectedRequest.user.name || "Nom non défini"
                                        }
                                      </p>
                                    </div>
                                    <div>
                                      <Label>Téléphone</Label>
                                      <p>{selectedRequest.user.phone}</p>
                                    </div>
                                    <div>
                                      <Label>Type de document</Label>
                                      <p>{getDocumentTypeText(selectedRequest.documentType)}</p>
                                    </div>
                                    <div>
                                      <Label>Date de soumission</Label>
                                      <p>
                                        {new Date(selectedRequest.submittedAt).toLocaleDateString('fr-FR')}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Document */}
                                  <div>
                                    <Label>Document soumis</Label>
                                    <div className="mt-2 border rounded-lg p-4">
                                      {selectedRequest.documentUrl.endsWith('.pdf') ? (
                                        <div className="text-center py-8">
                                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                          <p className="text-sm text-gray-600 mb-4">Document PDF</p>
                                          <Button variant="outline" asChild>
                                            <a href={selectedRequest.documentUrl} target="_blank" rel="noopener noreferrer">
                                              Ouvrir le PDF
                                            </a>
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="relative w-full h-64">
                                          <Image
                                            src={selectedRequest.documentUrl}
                                            alt="Document d'identité"
                                            fill
                                            className="object-contain rounded"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Notes admin */}
                                  <div>
                                    <Label htmlFor="adminNotes">Commentaires (optionnel)</Label>
                                    <Textarea
                                      id="adminNotes"
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Ajoutez des commentaires pour l'utilisateur..."
                                      className="mt-1"
                                      disabled={isProcessing}
                                    />
                                  </div>

                                  {/* Actions */}
                                  <div className="flex justify-end space-x-3">
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleReject(selectedRequest.id)}
                                      disabled={isProcessing}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Rejeter
                                    </Button>
                                    <Button
                                      onClick={() => handleApprove(selectedRequest.id)}
                                      disabled={isProcessing}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approuver
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}