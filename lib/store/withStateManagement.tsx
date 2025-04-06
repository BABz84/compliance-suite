"use client"

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  useAiStore, 
  useDocumentStore, 
  useAuthStore, 
  useUIState,
  AiFeatureType,
  DocumentType
} from '@/lib/store'

// Map feature paths to their corresponding feature types in the AI store
const featureTypeMap: Record<string, AiFeatureType> = {
  '/regulatory-qa': 'regulatory-qa',
  '/contract-review': 'contract-review',
  '/policy-drafting': 'policy-drafting',
  '/regulatory-summarization': 'summarization'
}

// Map paths to their corresponding document types
const documentTypeMap: Record<string, DocumentType | 'all'> = {
  '/regulatory-qa': 'regulation',
  '/contract-review': 'all', // Shows both contracts and regulations
  '/policy-drafting': 'policy',
  '/regulatory-summarization': 'regulation'
}

export function withStateManagement<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WrappedComponent(props: P) {
    const pathname = usePathname()
    
    // Extract the feature path from the pathname
    // This handles both /path and /path/subpath patterns
    const basePathMatch = pathname.match(/\/[^/]+/)
    const basePath = basePathMatch ? basePathMatch[0] : ''
    
    // Get the stores
    const { setFeatureFilter } = useAiStore()
    const { setDocumentTypeFilter } = useDocumentStore()
    const { user } = useAuthStore()
    const { setPageTitle } = useUIState()
    
    // Set feature filters based on the current path
    useEffect(() => {
      // Set the AI store feature filter
      if (featureTypeMap[basePath]) {
        setFeatureFilter(featureTypeMap[basePath])
      }
      
      // Set the document store filter
      if (documentTypeMap[basePath]) {
        setDocumentTypeFilter(documentTypeMap[basePath])
      }
      
      // Set page title based on path
      const title = basePath.substring(1).split('-').map(
        word => word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
      
      if (title) {
        setPageTitle(title)
      }
    }, [basePath, setFeatureFilter, setDocumentTypeFilter, setPageTitle])
    
    // Check for authentication
    useEffect(() => {
      // Authentication logic could go here
      // For example, redirect if not authenticated
    }, [user])
    
    // Render the wrapped component with all props
    return <Component {...props} />
  }
} 