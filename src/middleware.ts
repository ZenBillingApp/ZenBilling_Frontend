import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/customers','/customers/[id]','/dashboard','/invoices', '/invoices/[id]','/invoices/create','/my-company'

  ]
}

export async function middleware(request: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    const token = request.cookies.get('token')
    const path = request.nextUrl.pathname


    // Gérer le cas où il n'y a pas de token
    if (!token?.value) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }

    // Vérifier que l'URL de l'API est définie
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      throw new Error('API URL not configured')
    }

    // Vérifier l'utilisateur
    const response = await fetch(`${apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${token.value}`
      },
      // Ajouter un timeout pour éviter les requêtes infinies
      signal: AbortSignal.timeout(5000)
    })

    // Gérer les erreurs HTTP
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const user = await response.json()

    // Vérifier si l'utilisateur a une entreprise
    if (!user.company_id) {
      return NextResponse.redirect(new URL('/company-signup', request.url))
    }

    // Ajouter les informations utilisateur aux headers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-token', token.value)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-company-id', user.company_id)

    // Continuer avec la requête enrichie
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('Middleware error:', error)

    // Nettoyer les cookies et rediriger vers login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    
    // Si c'est une erreur d'API, on peut ajouter un message d'erreur dans l'URL
    if (error instanceof Error) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'session_expired')
      return NextResponse.redirect(loginUrl)
    }

    return response
  }
}