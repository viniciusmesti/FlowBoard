import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Rotas que precisam de autenticação
const protectedRoutes = ["/notifications", "/settings", "/archived"]

// Rotas públicas (não precisam de autenticação)
const publicRoutes = ["/login", "/register"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Se for rota pública, permitir acesso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Se for rota protegida, verificar autenticação
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token =
      request.cookies.get("auth_token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
            // return NextResponse.redirect(new URL("/login", request.url))
            return NextResponse.next()
    }

    try {
      const payload = verifyToken(token)
      if (!payload) {
                // return NextResponse.redirect(new URL("/login", request.url))
                return NextResponse.next()
      }
      return NextResponse.next()
    } catch (error) {
            // return NextResponse.redirect(new URL("/login", request.url))
            return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
