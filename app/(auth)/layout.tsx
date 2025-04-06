"use client";

import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
} 