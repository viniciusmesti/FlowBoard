import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { NotificationProvider } from "@/contexts/NotificationContext"
import { ScrumBoardProvider } from "@/contexts/ScrumBoardContext"
import { ToastContainer } from "@/components/toast-container"
import { UserMenu } from "@/components/user-menu"

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
      <ScrumBoardProvider>
          <AuthProvider>
            <NotificationProvider>
              <div className="w-full flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-50">
                <span className="font-bold text-lg text-blue-700">FlowBoard</span>
                <UserMenu />
              </div>
              {children}
              <ToastContainer />
            </NotificationProvider>
          </AuthProvider>
        </ScrumBoardProvider>
      </body>
    </html>
  )
}
