import { type NextRequest, NextResponse } from "next/server"
import { mockUsers, createToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    // Validar dados
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 })
    }

    // Verificar se email já existe
    const existingUser = mockUsers.find((u) => u.email === email)
    if (existingUser) {
      return NextResponse.json({ message: "Este email já está em uso" }, { status: 409 })
    }

    // Criar novo usuário
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      role,
      avatar: "/placeholder.svg?height=32&width=32",
    }

    mockUsers.push(newUser)

    // Gerar token
    const token = createToken({ userId: newUser.id, email: newUser.email })

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Erro no cadastro:", error)
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 })
  }
}
