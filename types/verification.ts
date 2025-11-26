export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUBMITTED = 'SUBMITTED'
}

export enum DocumentType {
  NATIONAL_ID = 'NATIONAL_ID',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  OTHER = 'OTHER'
}

export interface VerificationRequest {
  id: string
  userId: string
  documentType: DocumentType
  documentUrl: string
  documentName: string
  status: VerificationStatus
  submittedAt: Date
  reviewedAt?: Date
  reviewedById?: string
  adminNotes?: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  updatedAt: Date
}

export interface ExtendedUser {
  id: string
  phone: string
  name?: string
  firstName?: string
  lastName?: string
  age?: number
  gender?: Gender
  avatar?: string
  verified: boolean
  isAdmin: boolean
  verificationStatus: VerificationStatus
  score: number
  totalRating: number
  ratingCount: number
  createdAt: Date
  updatedAt: Date
}

export interface VerificationRequestWithUser extends VerificationRequest {
  user: {
    id: string
    phone: string
    firstName?: string
    lastName?: string
    name?: string
  }
}

// Types pour les formulaires
export interface RegisterFormData {
  phone: string
  password: string
  confirmPassword: string
}

export interface ProfileFormData {
  firstName: string
  lastName: string
  age: number
  gender: Gender
}

export interface VerificationFormData {
  documentType: DocumentType
  document: File
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface VerificationApiResponse {
  success: boolean
  data?: {
    requestId: string
    status: VerificationStatus
    message: string
  }
  error?: string
}

// Types pour l'admin dashboard
export interface AdminStats {
  totalUsers: number
  verifiedUsers: number
  pendingVerifications: number
  totalListings: number
  activeListings: number
}

export interface AdminVerificationAction {
  requestId: string
  action: 'approve' | 'reject'
  adminNotes?: string
}