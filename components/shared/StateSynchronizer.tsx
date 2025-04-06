"use client"

import { useStateSynchronizer } from "@/lib/store/useStateSynchronizer"

/**
 * Component that handles state synchronization across the application.
 * This is a "headless" component that doesn't render anything visible.
 */
export function StateSynchronizer() {
  // The hook handles all the synchronization logic
  useStateSynchronizer()
  
  // This component doesn't render anything
  return null
} 