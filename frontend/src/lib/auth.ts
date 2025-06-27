import type { User } from "@/types"

// Tipo para usuário com senha (usado internamente)
export type UserWithPassword = User & { password: string }

// Dados mock de usuários para desenvolvimento
export const mockUsers: UserWithPassword[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@flowboard.com",
    password: "admin123",
    role: "admin",
    avatar: "/placeholder.png?height=32&width=32",
  },
  {
    id: "2",
    name: "João Silva",
    email: "joao@flowboard.com",
    password: "123456",
    role: "developer",
    avatar: "/placeholder.png?height=32&width=32",
  },
  {
    id: "3",
    name: "Maria Santos",
    email: "maria@flowboard.com",
    password: "123456",
    role: "designer",
    avatar: "/placeholder.png?height=32&width=32",
  },
  {
    id: "4",
    name: "Pedro Costa",
    email: "pedro@flowboard.com",
    password: "123456",
    role: "tester",
    avatar: "/placeholder.png?height=32&width=32",
  },
]

// Função para criar token simples (sem JWT)
export function createToken(payload: { userId: string; email: string }): string {
  const tokenData = {
    ...payload,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
  }
  return btoa(JSON.stringify(tokenData))
}

// Função para verificar token
export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = JSON.parse(atob(token))

    // Verificar se o token não expirou
    if (decoded.exp && decoded.exp < Date.now()) {
      return null
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    }
  } catch {
    return null
  }
}

// Função para adicionar novo usuário (para registro)
export function addMockUser(user: UserWithPassword): void {
  mockUsers.push(user)
}
