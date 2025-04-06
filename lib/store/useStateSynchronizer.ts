"use client"

import { useEffect } from 'react'
import { useAuthStore, useDocumentStore, useAiStore, useUIState } from '@/lib/store'

/**
 * A hook to synchronize state between different stores and handle complex interactions.
 * This ensures that dependent state updates happen in the correct order and avoids race conditions.
 */
export function useStateSynchronizer() {
  // Access all stores
  const { user, authStatus } = useAuthStore()
  const { 
    documents, 
    uploadStatus, 
    processingStatus,
    setProcessingStatus, 
    setDocuments
  } = useDocumentStore() 
  const { 
    interactions, 
    pendingReviews, 
    updateInteraction,
    setInteractionStatus,
    featureFilter
  } = useAiStore()
  const { 
    status: uiStatus, 
    triggerEvent, 
    getLastEventTime 
  } = useUIState()
  
  // Sync auth status with document processing
  useEffect(() => {
    if (authStatus === 'loading') {
      setProcessingStatus('loading')
    }
  }, [authStatus, setProcessingStatus])
  
  // Auto-update pending reviews when interactions change
  useEffect(() => {
    const pendingReviewIds = pendingReviews.map(review => review.id)
    const potentialNewPending = interactions.filter(
      interaction => interaction.reviewStatus === 'pending' && 
      !pendingReviewIds.includes(interaction.id)
    )
    
    // Add any new pending reviews that might have been missed
    potentialNewPending.forEach(interaction => {
      updateInteraction(interaction.id, { reviewStatus: 'pending' })
    })
  }, [interactions, pendingReviews, updateInteraction])
  
  // Handle document upload completion
  useEffect(() => {
    if (uploadStatus === 'success') {
      // Signal that documents have been updated
      triggerEvent('document-updated')
    }
  }, [uploadStatus, triggerEvent])
  
  // Handle AI interaction status changes
  useEffect(() => {
    if (uiStatus === 'error') {
      // Propagate general UI errors to the AI interaction system
      setInteractionStatus('error', 'An error occurred in the application')
    }
  }, [uiStatus, setInteractionStatus])
  
  // Refresh filtered documents when feature filter changes
  useEffect(() => {
    if (featureFilter !== 'all') {
      // Different features need different document types
      triggerEvent('filter-changed')
    }
  }, [featureFilter, triggerEvent])
  
  // Sync user permissions with available actions
  useEffect(() => {
    if (user) {
      const canReview = user.role === 'admin' || user.role === 'sme'
      
      // Update UI state based on user permissions
      // This could trigger UI updates across components
      triggerEvent(canReview ? 'review-permissions-granted' : 'review-permissions-denied')
    }
  }, [user, triggerEvent])
  
  return null // This hook is for effects only
} 