import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Vérifier si l'utilisateur essaie d'accéder aux routes admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      // Vérifier si l'utilisateur est admin
      if (!req.nextauth.token?.isAdmin) {
        // Rediriger vers la page d'accueil si pas admin
        return NextResponse.redirect(new URL("/", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Pour les routes admin, vérifier l'authentification ET le statut admin
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token && !!token.isAdmin
        }

        // Pour les autres routes protégées, juste vérifier l'authentification
        if (req.nextUrl.pathname.startsWith("/verification")) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/verification/:path*"
  ]
}