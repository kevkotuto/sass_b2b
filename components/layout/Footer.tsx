import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-[#F9FAFB] pt-16 pb-8 px-6 md:px-12 border-t border-gray-100">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <Link href="/" className="text-2xl font-serif text-[#F59E0B] mb-4 block">
                        AGORA
                    </Link>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        Mettre en relation les propriétaires avec des professionnels de confiance grâce à un système de mise en relation basé sur l'IA et à une expérience de réservation fluide.
                    </p>
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-500 hover:text-gray-900">
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-900">
                            <Linkedin className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div className="col-span-1">
                    {/* Spacer or empty column if needed to match layout exactly, but usually links are here */}
                </div>

                <div className="col-span-1">
                    <h3 className="font-bold text-gray-900 mb-4">Pour les clients</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li><Link href="#" className="hover:text-gray-900">Trouver un service</Link></li>
                        <li><Link href="#" className="hover:text-gray-900">Comment ça marche</Link></li>
                        <li><Link href="#" className="hover:text-gray-900">Sécurité et confiance</Link></li>
                        <li><Link href="#" className="hover:text-gray-900">Support clientèle</Link></li>
                    </ul>
                </div>

                <div className="col-span-1">
                    <h3 className="font-bold text-gray-900 mb-4">Pour les prestataires</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li><Link href="#" className="hover:text-gray-900">Devenir prestataire</Link></li>
                        <li><Link href="#" className="hover:text-gray-900">Ressources pour les prestataires</Link></li>
                        <li><Link href="#" className="hover:text-gray-900">Réussites</Link></li>
                        <li><Link href="#" className="hover:text-gray-900">Assistance prestataire</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200 text-center md:text-left">
                <p className="text-sm text-gray-500">© 2025 AGORA. All rights reserved.</p>
            </div>
        </footer>
    )
}
