import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// Configuration pour matcher uniquement les routes du dossier (dashboard)
export const config = {
  matcher: [
    // Match le dossier (dashboard) et tous ses sous-dossiers
    '/(dashboard)/:path*',
  ]
}

export async function middleware(request: NextRequest) {
  // Récupérer le token depuis les cookies
  const token = request.cookies.get('token')
  
  // Obtenir le chemin de la requête
  const path = request.nextUrl.pathname

  // Si pas de token, rediriger vers la page de login
  if (!token) {
    // Sauvegarder l'URL actuelle pour la redirection post-login
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', path)
    
    return NextResponse.redirect(url)
  }

  try {
    // Vous pouvez ajouter ici votre logique de validation du token
    
    // Ajouter le token aux headers pour l'utiliser dans vos routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-token', token.value)

    // Continuer avec la requête modifiée
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // En cas de token invalide
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }
}