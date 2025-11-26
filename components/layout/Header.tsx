import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="bg-[#1E4D2B] text-white py-4 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-serif tracking-wide">
          AGORA
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        <Link href="/become-provider" className="hover:text-gray-200 transition-colors">
          Devenir prestataire
        </Link>
        <Link href="/auth/login" className="hover:text-gray-200 transition-colors">
          Connexion
        </Link>
        <Button asChild className="bg-black hover:bg-gray-900 text-white rounded-md px-6">
          <Link href="/auth/register">
            Inscription
          </Link>
        </Button>
      </nav>
      
      {/* Mobile menu button placeholder - can be implemented if needed */}
      <div className="md:hidden">
        {/* Hamburger icon */}
      </div>
    </header>
  )
}
