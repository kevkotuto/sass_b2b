import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// GET /api/conversations - Récupérer les conversations d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            images: true,
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
                score: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      },
      orderBy: { lastMessageAt: "desc" }
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/conversations - Créer une nouvelle conversation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { listingId } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 })
    }

    // Vérifier que l'annonce existe
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Vérifier si une conversation existe déjà
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        userId: session.user.id,
        listingId: listingId
      }
    })

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id })
    }

    // Créer une nouvelle conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        listingId: listingId
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            currency: true,
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
                score: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ conversationId: conversation.id, conversation })
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}