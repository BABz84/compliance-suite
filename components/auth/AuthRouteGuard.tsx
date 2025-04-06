"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppState } from "@/lib/store/AppStateProvider"

interface AuthRouteGuardProps {
  children: React.ReactNode
  requiredPermission?: string | null
}

export function AuthRouteGuard({ 
  children, 
  requiredPermission = null 
}: AuthRouteGuardProps) {
  const { auth } = useAppState()
  const router = useRouter()
  const pathname = usePathname()
  
  // Extract these for cleaner code
  const isAuthenticated = auth?.isAuthenticated
  const hasPermission = auth?.hasPermission
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password']
  
  useEffect(() => {
    const isPublicRoute = publicRoutes.includes(pathname)
    
    if (!isAuthenticated && !isPublicRoute) {
      // Redirect to login if not authenticated and not on a public route
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`)
    } else if (isAuthenticated && requiredPermission && hasPermission && !hasPermission(requiredPermission)) {
      // Redirect to dashboard if authenticated but missing required permission
      router.push('/')
    }
  }, [isAuthenticated, pathname, router, hasPermission, requiredPermission])
  
  // Show nothing while checking authentication
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null
  }
  
  // Show nothing if missing required permission
  if (requiredPermission && hasPermission && !hasPermission(requiredPermission)) {
    return null
  }
  
  return <>{children}</>
} 