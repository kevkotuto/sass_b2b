"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronDown, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone")
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        type: loginMethod,
        redirect: false
      })

      if (result?.error) {
        setError("Identifiants incorrects")
      } else {
        router.push("/")
      }
    } catch (error) {
      setError("Une erreur s'est produite lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="text-center mb-6">
        <h2 className="text-gray-900 font-medium text-lg">
          Connectez vous à agora ou Créez votre compte
        </h2>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === "phone" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => {
            setLoginMethod("phone")
            setIdentifier("")
          }}
        >
          Téléphone
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginMethod === "email" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          onClick={() => {
            setLoginMethod("email")
            setIdentifier("")
          }}
        >
          Email
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-50 text-red-600 border-red-100">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loginMethod === "phone" ? (
          <div className="space-y-2 text-left">
            <label className="text-xs text-gray-600 font-medium ml-1">
              Entrez votre numéro
            </label>
            <div className="flex">
              <div className="flex items-center justify-between px-3 py-2 border border-r-0 border-gray-200 rounded-l-md bg-white min-w-[80px]">
                <span className="text-sm text-gray-700 font-medium">CI</span>
                <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
              </div>
              <Input
                type="tel"
                placeholder="+225 00 00 00 00"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="rounded-l-none border-gray-200 focus-visible:ring-orange-500"
                required
                disabled={isLoading}
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
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="border-gray-200 focus-visible:ring-orange-500"
              required
              disabled={isLoading}
            />
          </div>
        )}


        <div className="space-y-2 text-left">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-600 font-medium ml-1">
              Mot de passe
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-gray-200 focus-visible:ring-orange-500 pr-10"
              required
              disabled={isLoading}
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

        <Button
          type="submit"
          className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-6 rounded-md uppercase tracking-wide"
          disabled={isLoading}
        >
          {isLoading ? "Connexion..." : "Se connecter"}
        </Button>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-300 text-gray-700 font-medium py-6 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2"
            onClick={() => { }} // Google auth placeholder
          >
            <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
              {/* Simple circle placeholder for Google logo if icon not available */}
              <span className="text-[10px] font-bold">G</span>
            </div>
            Continuer avec Google
          </Button>

          <div className="text-center text-sm font-medium">
            <span className="text-gray-900">Vous n'avez pas encore de compte? </span>
            <Link href="/auth/register" className="text-[#1E3A8A] hover:underline font-bold">
              Inscrivez-vous
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}