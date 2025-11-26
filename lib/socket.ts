import { Server as HTTPServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

const prisma = new PrismaClient()

export class SocketHandler {
  private io: SocketIOServer

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    this.setupSocketHandlers()
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log("User connected:", socket.id)

      // Rejoindre une conversation
      socket.on("join_conversation", async (conversationId: string) => {
        socket.join(`conversation_${conversationId}`)
        console.log(`User ${socket.id} joined conversation ${conversationId}`)
      })

      // Quitter une conversation
      socket.on("leave_conversation", (conversationId: string) => {
        socket.leave(`conversation_${conversationId}`)
      })

      // Envoyer un message
      socket.on("send_message", async (data: {
        conversationId: string
        content: string
        senderId: string
        receiverId: string
        type?: "TEXT" | "IMAGE" | "FILE"
      }) => {
        try {
          // Sauvegarder le message en DB
          const message = await prisma.message.create({
            data: {
              content: data.content,
              type: data.type || "TEXT",
              senderId: data.senderId,
              receiverId: data.receiverId,
              conversationId: data.conversationId
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  score: true
                }
              }
            }
          })

          // Mettre à jour la conversation
          await prisma.conversation.update({
            where: { id: data.conversationId },
            data: { lastMessageAt: new Date() }
          })

          // Diffuser le message à tous les participants de la conversation
          this.io.to(`conversation_${data.conversationId}`).emit("new_message", message)

        } catch (error) {
          console.error("Error saving message:", error)
          socket.emit("message_error", { error: "Failed to send message" })
        }
      })

      // Marquer les messages comme lus
      socket.on("mark_messages_read", async (data: {
        conversationId: string
        userId: string
      }) => {
        try {
          await prisma.message.updateMany({
            where: {
              conversationId: data.conversationId,
              receiverId: data.userId,
              read: false
            },
            data: { read: true }
          })

          // Notifier que les messages ont été lus
          this.io.to(`conversation_${data.conversationId}`).emit("messages_read", {
            conversationId: data.conversationId,
            readBy: data.userId
          })
        } catch (error) {
          console.error("Error marking messages as read:", error)
        }
      })

      // Notification de frappe
      socket.on("typing", (data: { conversationId: string, userId: string, isTyping: boolean }) => {
        socket.to(`conversation_${data.conversationId}`).emit("user_typing", {
          userId: data.userId,
          isTyping: data.isTyping
        })
      })

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id)
      })
    })
  }

  public getIO() {
    return this.io
  }
}

export let socketHandler: SocketHandler | null = null

export const initializeSocket = (server: HTTPServer) => {
  if (!socketHandler) {
    socketHandler = new SocketHandler(server)
  }
  return socketHandler
}