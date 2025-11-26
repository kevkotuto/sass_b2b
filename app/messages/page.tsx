"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Send,
  MessageSquare,
  User,
  Phone,
  MapPin,
  Package,
  Clock,
  Search,
  MoreVertical
} from "lucide-react"

interface Message {
  id: string
  content: string
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM"
  senderId: string
  receiverId: string
  read: boolean
  createdAt: string
  sender: {
    id: string
    phone: string
    firstName?: string
    lastName?: string
    name?: string
    avatar?: string
  }
}

interface Conversation {
  id: string
  userId: string
  listingId: string
  lastMessageAt: string
  user: {
    id: string
    phone: string
    firstName?: string
    lastName?: string
    name?: string
    avatar?: string
  }
  listing: {
    id: string
    title: string
    price?: number
    currency: string
    images: string[]
    type: "PRODUCT" | "SERVICE"
  }
  messages: Message[]
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Redirection si non connecté
  if (status === "loading") {
    return <div>Chargement...</div>
  }

  if (!session?.user) {
    router.push("/auth/login")
    return null
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/conversations")

      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])

        // Sélectionner automatiquement la première conversation
        if (data.conversations && data.conversations.length > 0) {
          setSelectedConversation(data.conversations[0])
        }
      } else {
        setError("Erreur lors du chargement des conversations")
      }
    } catch (error) {
      setError("Erreur lors du chargement des conversations")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)

      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])

        // Marquer les messages comme lus
        await markMessagesAsRead(conversationId)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error)
    }
  }

  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/conversations/${conversationId}/mark-read`, {
        method: "POST"
      })
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || isSending) return

    setIsSending(true)

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          type: "TEXT"
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage("")

        // Mettre à jour la conversation dans la liste
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? { ...conv, lastMessageAt: new Date().toISOString() }
              : conv
          )
        )
      } else {
        setError("Erreur lors de l'envoi du message")
      }
    } catch (error) {
      setError("Erreur lors de l'envoi du message")
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    }
  }

  const getUserDisplayName = (user: any) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.name || user.phone
  }

  const getUserInitials = (user: any) => {
    if (user.firstName && user.lastName) {
      return user.firstName[0] + user.lastName[0]
    }
    if (user.name) {
      return user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)
    }
    return "U"
  }

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true

    const userName = getUserDisplayName(conv.user).toLowerCase()
    const listingTitle = conv.listing.title.toLowerCase()
    const query = searchQuery.toLowerCase()

    return userName.includes(query) || listingTitle.includes(query)
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p>Chargement des messages...</p>
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
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-6 h-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Liste des conversations */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Recherche */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
                <p className="text-gray-600">
                  {searchQuery ? "Aucune conversation trouvée" : "Vos conversations apparaîtront ici"}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                      selectedConversation?.id === conversation.id ? "bg-blue-50 border-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversation.user.avatar || ""} />
                        <AvatarFallback className="bg-blue-500 text-white">
                          {getUserInitials(conversation.user)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getUserDisplayName(conversation.user)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatMessageTime(conversation.lastMessageAt)}
                          </p>
                        </div>

                        <p className="text-sm text-gray-600 truncate mb-1">
                          {conversation.listing.title}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {conversation.listing.type === "PRODUCT" ? "Produit" : "Service"}
                            </Badge>
                            {conversation.listing.price && (
                              <span className="text-xs text-gray-500">
                                {conversation.listing.price.toLocaleString()} {conversation.listing.currency}
                              </span>
                            )}
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zone de messages */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Header de la conversation */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.user.avatar || ""} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {getUserInitials(selectedConversation.user)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getUserDisplayName(selectedConversation.user)}</p>
                      <p className="text-sm text-gray-600">{selectedConversation.user.phone}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">{selectedConversation.listing.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <Package className="w-3 h-3" />
                      <span>{selectedConversation.listing.type === "PRODUCT" ? "Produit" : "Service"}</span>
                      {selectedConversation.listing.price && (
                        <>
                          <span>•</span>
                          <span>{selectedConversation.listing.price.toLocaleString()} {selectedConversation.listing.currency}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === session.user.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === session.user.id
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === session.user.id ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    disabled={isSending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim() || isSending}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
                <p className="text-gray-600">Choisissez une conversation pour commencer à discuter</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}