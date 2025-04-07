"use client";

import { ProtectedLayout } from "@/components/shared/ProtectedLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The main app shell (Sidebar, Header) is now rendered by AuthWrapper
  // in the root layout based on authentication status.
  // This layout only needs to wrap its children, potentially with
  // additional auth-specific context or checks if needed (like ProtectedLayout).
  return (
    <ProtectedLayout>
      {children} 
    </ProtectedLayout>
  );
}