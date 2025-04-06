"use client";

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated } = useAuth();
  
  // Show loading state while checking authentication
  if (isAuthenticated === false) {
    return (
      <div className="p-8 flex flex-col space-y-4 items-center justify-center min-h-[500px]">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
        <Skeleton className="h-4 w-[300px]" />
        <div className="mt-8 flex flex-col space-y-3 w-full max-w-md">
          <Skeleton className="h-[125px] w-full rounded-lg" />
          <Skeleton className="h-[125px] w-full rounded-lg" />
          <Skeleton className="h-[125px] w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
} 