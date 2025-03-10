import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


const publicRoutes = ['/login', '/register']



export default function middleware(request: NextRequest) {
  // Récupérer le token depuis le localStorage
  const token = request.cookies.get('token')?.value

  // Vérifier si l'utilisateur tente d'accéder à une route protégée
  
    if (!token && !publicRoutes.includes(request.nextUrl.pathname)) {
      // Rediriger vers la page de connexion si pas de token
      return NextResponse.redirect(new URL('/login', request.url))
    }
  

  // Rediriger vers le dashboard si l'utilisateur est déjà connecté et essaie d'accéder à /login
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/invoices', request.url))
  }

  return NextResponse.next()
}

// Configurer les chemins à matcher
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/invoices/:path*',
    '/products/:path*',
    '/customers/:path*',
    '/login',
    '/register'
  ]
} 