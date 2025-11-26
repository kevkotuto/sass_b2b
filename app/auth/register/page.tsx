"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, Eye, EyeOff } from "lucide-react"
import { Gender } from "@/types/verification"

interface Step1Data {
  phone: string
  email: string
  password: string
  confirmPassword: string
}

interface Step2Data {
  firstName: string
  lastName: string
  age: number
  gender: Gender
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerMethod, setRegisterMethod] = useState<"phone" | "email">("phone")

  const [step1Data, setStep1Data] = useState<Step1Data>({
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const [step2Data, setStep2Data] = useState<Step2Data>({
    firstName: "",
    lastName: "",
    age: 18,
    gender: Gender.MALE
  })

  const router = useRouter()

  const validateStep1 = () => {
    if (registerMethod === "phone" && !step1Data.phone) {
      setError("Le numéro de téléphone est obligatoire")
      return false
    }

    if (registerMethod === "email" && !step1Data.email) {
      setError("L'adresse email est obligatoire")
      return false
    }

    if (!step1Data.password || !step1Data.confirmPassword) {
      setError("Le mot de passe est obligatoire")
      return false
    }

    if (step1Data.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return false
    }

    if (step1Data.password !== step1Data.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (!step2Data.firstName || !step2Data.lastName) {
      setError("Le prénom et le nom sont obligatoires")
      return false
    }

    if (step2Data.age < 16 || step2Data.age > 120) {
      setError("L'âge doit être entre 16 et 120 ans")
      return false
    }

    return true
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!validateStep2()) {
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...step1Data,
          ...step2Data,
          registerMethod
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur s'est produite")
      } else {
        router.push("/auth/login?message=account-created")
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la création du compte")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-gray-900 font-medium text-lg">
          {currentStep === 1 ? "Créez votre compte" : "Complétez votre profil"}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Étape {currentStep}/2
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-red-50 text-red-600 border-red-100">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentStep === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${registerMethod === "phone" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setRegisterMethod("phone")}
            >
              Téléphone
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${registerMethod === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setRegisterMethod("email")}
            >
              Email
            </button>
          </div>

          {registerMethod === "phone" ? (
            <div className="space-y-2 text-left">
              <label className="text-xs text-gray-600 font-medium ml-1">
                Numéro de téléphone
              </label>
              <div className="flex">
                <div className="flex items-center justify-between px-3 py-2 border border-r-0 border-gray-200 rounded-l-md bg-white min-w-[80px]">
                  <span className="text-sm text-gray-700 font-medium">CI</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                </div>
                <Input
                  type="tel"
                  placeholder="+225 00 00 00 00"
                  value={step1Data.phone}
                  onChange={(e) => setStep1Data(prev => ({ ...prev, phone: e.target.value }))}
                  className="rounded-l-none border-gray-200 focus-visible:ring-orange-500"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-left">
              <label className="text-xs text-gray-600 font-medium ml-1">
                Adresse email
              </label>
              <Input
                type="email"
                placeholder="exemple@email.com"
                value={step1Data.email}
                onChange={(e) => setStep1Data(prev => ({ ...prev, email: e.target.value }))}
                className="border-gray-200 focus-visible:ring-orange-500"
                required
              />
            </div>
          )}

          <div className="space-y-2 text-left">
            <label className="text-xs text-gray-600 font-medium ml-1">
              Mot de passe
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 caractères"
                value={step1Data.password}
                onChange={(e) => setStep1Data(prev => ({ ...prev, password: e.target.value }))}
                className="border-gray-200 focus-visible:ring-orange-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs text-gray-600 font-medium ml-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Répétez votre mot de passe"
                value={step1Data.confirmPassword}
                onChange={(e) => setStep1Data(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="border-gray-200 focus-visible:ring-orange-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-6 rounded-md uppercase tracking-wide"
          >
            Continuer
          </Button>

          <div className="text-center text-sm font-medium">
            <span className="text-gray-900">Déjà un compte ? </span>
            <Link href="/auth/login" className="text-[#1E3A8A] hover:underline font-bold">
              Se connecter
            </Link>
          </div>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-left">
              <label className="text-xs text-gray-600 font-medium ml-1">Prénom</label>
              <Input
                type="text"
                placeholder="Prénom"
                value={step2Data.firstName}
                onChange={(e) => setStep2Data(prev => ({ ...prev, firstName: e.target.value }))}
                className="border-gray-200 focus-visible:ring-orange-500"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-xs text-gray-600 font-medium ml-1">Nom</label>
              <Input
                type="text"
                placeholder="Nom"
                value={step2Data.lastName}
                onChange={(e) => setStep2Data(prev => ({ ...prev, lastName: e.target.value }))}
                className="border-gray-200 focus-visible:ring-orange-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs text-gray-600 font-medium ml-1">Âge</label>
            <Input
              type="number"
              min="16"
              max="120"
              placeholder="Votre âge"
              value={step2Data.age}
              onChange={(e) => setStep2Data(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
              className="border-gray-200 focus-visible:ring-orange-500"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs text-gray-600 font-medium ml-1">Sexe</label>
            <Select
              value={step2Data.gender}
              onValueChange={(value: Gender) => setStep2Data(prev => ({ ...prev, gender: value }))}
              disabled={isLoading}
            >
              <SelectTrigger className="border-gray-200 focus:ring-orange-500">
                <SelectValue placeholder="Sélectionnez votre sexe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.MALE}>Homme</SelectItem>
                <SelectItem value={Gender.FEMALE}>Femme</SelectItem>
                <SelectItem value={Gender.OTHER}>Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="flex-1 py-6 border-gray-300"
              disabled={isLoading}
            >
              Retour
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-6 rounded-md uppercase tracking-wide"
              disabled={isLoading}
            >
              {isLoading ? "Création..." : "Créer le compte"}
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}