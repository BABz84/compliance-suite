"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useAuthStore, useDocumentStore, useAiStore, useUIState } from '@/lib/store'

// Define the shape of the context value
export type AppStateContextType = {
  auth: ReturnType<typeof useAuthStore>
  documents: ReturnType<typeof useDocumentStore>
  ai: ReturnType<typeof useAiStore>
  ui: ReturnType<typeof useUIState>
}

// Create a context that provides access to all stores
export const AppStateContext = createContext<AppStateContextType | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  // Initialize all stores
  const auth = useAuthStore()
  const documents = useDocumentStore()
  const ai = useAiStore()
  const ui = useUIState()
  
  return (
    <AppStateContext.Provider value={{ auth, documents, ai, ui }}>
      {children}
    </AppStateContext.Provider>
  )
}

// Convenience hook to access all stores with explicit non-null return type
export function useAppState(): AppStateContextType {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}