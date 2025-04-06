"use client"

import { ThemeToggle } from "./theme-toggle"
import { UserButton } from "./user-button"
import { useAppState } from "@/lib/store/AppStateProvider"

export function Header() {
  const { auth: { user, isAuthenticated } } = useAppState()
  
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-4 justify-between">
        <div className="font-semibold">Gen-AI Compliance Suite</div>
        <div className="flex items-center gap-4">
          {isAuthenticated && user && (
            <span className="text-sm text-muted-foreground">
              {user.name} ({user.role})
            </span>
          )}
          <UserButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

