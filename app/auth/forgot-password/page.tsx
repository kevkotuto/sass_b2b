"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { ChevronDown } from "lucide-react"

export default function ForgotPasswordPage() {
    const [phone, setPhone] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            setIsSubmitted(true)
        }, 1500)
    }

    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <h2 className="text-gray-900 font-medium text-lg">
                    Mot de passe oublié ?
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                    Entrez votre numéro de téléphone pour réinitialiser votre mot de passe
                </p>
            </div>

            {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="rounded-l-none border-gray-200 focus-visible:ring-orange-500"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-6 rounded-md uppercase tracking-wide"
                        disabled={isLoading}
                    >
                        {isLoading ? "Envoi en cours..." : "Envoyer le code"}
                    </Button>

                    <div className="text-center mt-4">
                        <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">
                            ← Retour à la connexion
                        </Link>
                    </div>
                </form>
            ) : (
                <div className="text-center space-y-6">
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm">
                        Si un compte existe avec ce numéro, vous recevrez un code de vérification.
                    </div>

                    <Button asChild className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-6 rounded-md uppercase tracking-wide">
                        <Link href={`/auth/otp?phone=${encodeURIComponent(phone)}`}>
                            Saisir le code
                        </Link>
                    </Button>
                </div>
            )}
        </AuthLayout>
    )
}
