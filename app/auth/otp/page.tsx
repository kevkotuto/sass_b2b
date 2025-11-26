"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthLayout } from "@/components/auth/AuthLayout"

export default function OTPPage() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const router = useRouter()
    const searchParams = useSearchParams()
    const phone = searchParams.get("phone") || "+225 05 05 05 0505" // Default mock

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Move to next input if value is entered
        if (value !== "" && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Move to previous input on backspace if current is empty
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const code = otp.join("")
        console.log("Submitting OTP:", code)
        // Add verification logic here
        router.push("/auth/login")
    }

    return (
        <AuthLayout>
            <div className="text-center mb-8">
                <h2 className="text-gray-900 font-bold text-lg mb-2">
                    Vérifiez votre numéro de téléphone
                </h2>
                <p className="text-sm text-gray-600">
                    Nous envoyons un code de vérification à:
                    <br />
                    <span className="font-medium text-gray-900">{phone}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex justify-center gap-2 sm:gap-4">
                    {otp.map((digit, index) => (
                        <Input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-medium border-gray-300 focus-visible:ring-orange-500 rounded-lg"
                        />
                    ))}
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-6 rounded-md uppercase tracking-wide"
                >
                    Soumettre
                </Button>

                <div className="text-center text-xs text-gray-500 mt-4">
                    <p>
                        En continuant, vous acceptez les conditions d'utilisation d'agora
                    </p>
                    <Link href="/terms" className="text-[#F59E0B] hover:underline mt-1 inline-block">
                        Termes et conditions
                    </Link>
                </div>
            </form>
        </AuthLayout>
    )
}
