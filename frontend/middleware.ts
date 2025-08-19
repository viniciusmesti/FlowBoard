import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Middleware ultra-simplificado para evitar erros no Edge Runtime
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
