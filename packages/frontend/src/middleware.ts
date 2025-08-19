import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
)

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']
const VERIFICATION_PATHS = ['/verify-email']
const PROTECTED_PATHS = ['/dashboard']
const PUBLIC_PATHS = ['/']

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const isAuthPath = AUTH_PATHS.some(path => pathname.startsWith(path))
  const isVerificationPath = VERIFICATION_PATHS.some(path => pathname.startsWith(path))
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  const isPublicPath = PUBLIC_PATHS.includes(pathname)

  const isAuthenticated = token ? await verifyToken(token) : false

  if (isVerificationPath) {
    return NextResponse.next()
  }

  if (isAuthenticated && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isAuthenticated && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isPublicPath) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}