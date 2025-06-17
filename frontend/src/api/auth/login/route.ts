import { type NextRequest, NextResponse } from "next/server"
import { mockUsers, createToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validar dados
    if (!email || !password) {
      return NextResponse.json({ message: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Buscar usuário
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (!user) {
      return NextResponse.json({ message: "Email ou senha incorretos" }, { status: 401 })
    }

    // Gerar token
    const token = createToken({ userId: user.id, email: user.email })

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
