import NextAuth from "next-auth"
import { VerificationStatus, Gender } from "./verification"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      phone: string
      name?: string | null
      firstName?: string | null
      lastName?: string | null
      email?: string | null
      image?: string | null
      avatar?: string | null
      score: number
      verified: boolean
      isAdmin: boolean
      verificationStatus: VerificationStatus
      age?: number | null
      gender?: Gender | null
    }
  }

  interface User {
    phone: string
    score: number
    avatar?: string | null
    verified: boolean
    isAdmin: boolean
    verificationStatus: VerificationStatus
    firstName?: string | null
    lastName?: string | null
    age?: number | null
    gender?: Gender | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    phone: string
    score: number
    verified: boolean
    isAdmin: boolean
    verificationStatus: VerificationStatus
    firstName?: string | null
    lastName?: string | null
    age?: number | null
    gender?: Gender | null
  }
}