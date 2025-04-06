"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

// Public routes that don't require authentication
const publicRoutes = ['/login'];

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  
  useEffect(() => {
    // Check if route requires authentication
    const isPublicRoute = publicRoutes.includes(pathname);
    
    if (!isAuthenticated && !isPublicRoute) {
      // Redirect to login if not authenticated and route is protected
      router.push('/login');
    } else if (isAuthenticated && pathname === '/login') {
      // Redirect to home if already authenticated and trying to access login
      router.push('/');
    }
  }, [isAuthenticated, pathname, router]);
  
  return { isAuthenticated, user };
} 