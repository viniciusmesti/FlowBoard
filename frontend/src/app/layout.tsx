import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { ToastContainer } from "@/components/toast-container"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Scrum Board - Sistema de Gestão de Projetos",
  description: "Sistema completo para gestão de projetos usando metodologia Scrum",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <ToastContainer />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
