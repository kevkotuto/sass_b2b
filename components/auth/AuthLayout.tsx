import Link from "next/link"

interface AuthLayoutProps {
    children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#1E4D2B] relative overflow-hidden">
            {/* Background Image/Overlay Effect - Simulating the handshake/bokeh background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a4023] via-[#2d5a36] to-[#0f2916]" />
                {/* We could add a background image here if we had one */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-50"></div>
            </div>

            {/* Bokeh effects */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>

            {/* Card Container */}
            <div className="relative z-10 w-full max-w-[520px] px-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12 w-full">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Link href="/" className="text-4xl font-serif tracking-wide">
                            <span className="text-[#F59E0B]">AGORA</span>
                        </Link>
                    </div>

                    {children}

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-900 font-medium">
                            © Copyright AGORA 2025 | Tous droits réservés
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
