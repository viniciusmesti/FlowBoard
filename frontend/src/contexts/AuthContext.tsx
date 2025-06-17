"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/types"
import { mockUsers, createToken, verifyToken, addMockUser, type UserWithPassword } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: User["role"]) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar se há token salvo ao carregar
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        const tokenPayload = verifyToken(token)
        if (tokenPayload) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        } else {
          // Token expirado
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_data")
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Buscar usuário nos dados mock
      const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

      if (!foundUser) {
        setError("Email ou senha incorretos")
        return false
      }

      // Criar token
      const token = createToken({ userId: foundUser.id, email: foundUser.email })

      // Remover senha dos dados do usuário
      const { password: _, ...userWithoutPassword } = foundUser

      // Salvar token e dados do usuário
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(userWithoutPassword))
      setUser(userWithoutPassword)

      return true
    } catch (error) {
      console.error("Erro no login:", error)
      setError("Erro de conexão. Tente novamente.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: User["role"]): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simular delay de rede
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Verificar se email já existe
      const existingUser = mockUsers.find((u) => u.email === email)
      if (existingUser) {
        setError("Este email já está em uso")
        return false
      }

      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres")
        return false
      }

      // Criar novo usuário com tipo correto
      const newUser: UserWithPassword = {
        id: Date.now().toString(),
        name,
        email,
        role,
        avatar: "/placeholder.svg?height=32&width=32",
        password,
      }

      // Adicionar aos usuários mock usando a função helper
      addMockUser(newUser)

      // Criar token
      const token = createToken({ userId: newUser.id, email: newUser.email })

      // Remover senha dos dados do usuário
      const { password: _, ...userWithoutPassword } = newUser

      // Salvar token e dados do usuário
      localStorage.setItem("auth_token", token)
      localStorage.setItem("user_data", JSON.stringify(userWithoutPassword))
      setUser(userWithoutPassword)

      return true
    } catch (error) {
      console.error("Erro no cadastro:", error)
      setError("Erro de conexão. Tente novamente.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
