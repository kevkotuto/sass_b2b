import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Numéro de téléphone", type: "tel" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          // Fallback for legacy calls
          if (credentials?.phone && credentials?.password) {
            credentials.identifier = credentials.phone
            credentials.type = "phone"
          } else {
            return null
          }
        }

        let user;

        if (credentials.type === "email") {
          user = await prisma.user.findUnique({
            where: {
              email: credentials.identifier
            }
          })
        } else {
          user = await prisma.user.findUnique({
            where: {
              phone: credentials.identifier
            }
          })
        }

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email || user.phone, // Fallback to phone if email is missing
          name: user.name,
          image: user.avatar,
          phone: user.phone,
          score: user.score,
          verified: user.verified,
          isAdmin: user.isAdmin,
          verificationStatus: user.verificationStatus as any,
          firstName: user.firstName,
          lastName: user.lastName,
          age: user.age,
          gender: user.gender as any,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.phone = user.phone
        token.score = user.score
        token.verified = user.verified
        token.isAdmin = user.isAdmin
        token.verificationStatus = user.verificationStatus
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.age = user.age
        token.gender = user.gender
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.phone = token.phone as string
        session.user.score = token.score as number
        session.user.verified = token.verified as boolean
        session.user.isAdmin = token.isAdmin as boolean
        session.user.verificationStatus = token.verificationStatus as any
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.age = token.age as number
        session.user.gender = token.gender as any
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/login",
  }
}