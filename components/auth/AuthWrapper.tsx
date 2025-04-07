"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { useAppState } from "@/lib/store/AppStateProvider"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { AuthRouteGuard } from "./AuthRouteGuard"

interface AuthWrapperProps {
  children: ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { auth } = useAppState()
  const pathname = usePathname()
  
  // Extract this for cleaner code - use !! to safely check for existence and truthiness
  const isAuthenticated = !!auth?.isAuthenticated
  
  // Define public routes that don't show the app shell
  const publicRoutes = ['/login', '/signup', '/forgot-password']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // If on public route, don't show app layout
  if (isPublicRoute) {
    return <AuthRouteGuard>{children}</AuthRouteGuard>
  }
  
  // If authenticated (and not public), show app layout
  // This is likely still causing duplication with app/(auth)/layout.tsx
  // but we'll fix that next.
  return (
    <AuthRouteGuard>
      <div className="grid min-h-screen grid-cols-[auto_1fr]">
        <Sidebar />
        <div className="flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthRouteGuard>
  )
}