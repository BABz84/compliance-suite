import { create } from 'zustand';
import { UIStatus } from './useUIState';
import { aiApi, ApiResponse } from '../api-client';

// AI feature type based on PRD
export type AiFeatureType = 
  | 'regulatory-qa' 
  | 'summarization' 
  | 'jurisdictional-comparison' 
  | 'contract-review' 
  | 'policy-drafting' 
  | 'control-design' 
  | 'alignment-gap';

// SME review status
export type ReviewStatus = 'pending' | 'accurate' | 'inaccurate' | 'needs-review';

// AI interaction interface
export interface AiInteraction {
  id: string;
  featureType: AiFeatureType;
  userId: string;
  userRole?: string;
  prompt: string;
  context?: Record<string, any>;
  response: string;
  createdAt: Date;
  reviewStatus: ReviewStatus;
  reviewerId?: string;
  reviewerFeedback?: string;
  reviewedAt?: Date;
  sourceCitations?: string[];
  documentId?: string;
}

// AI state interface
interface AiState {
  // AI Interactions state
  interactions: AiInteraction[];
  currentInteraction: AiInteraction | null;
  interactionStatus: UIStatus;
  interactionError: string | null;
  
  // Feedback state
  pendingReviews: AiInteraction[];
  
  // Filters for interactions list
  featureFilter: AiFeatureType | 'all';
  reviewStatusFilter: ReviewStatus | 'all';
  
  // Basic state actions
  addInteraction: (interaction: AiInteraction) => void;
  removeInteraction: (id: string) => void;
  setCurrentInteraction: (interaction: AiInteraction | null) => void;
  setInteractionStatus: (status: UIStatus, error?: string | null) => void;
  updateInteraction: (id: string, updates: Partial<AiInteraction>) => void;
  setFeatureFilter: (filter: AiFeatureType | 'all') => void;
  setReviewStatusFilter: (filter: ReviewStatus | 'all') => void;
  
  // API actions
  submitRegulatoryQuery: (query: string, documentIds?: string[]) => Promise<AiInteraction | null>;
  submitContractReview: (contractId: string, regulatoryIds?: string[]) => Promise<AiInteraction | null>;
  createSummarization: (documentId: string, options?: any) => Promise<AiInteraction | null>;
  createComparison: (documentIds: string[], comparisonType?: string) => Promise<AiInteraction | null>;
  createPolicyDraft: (data: any) => Promise<AiInteraction | null>;
  createControlDesign: (data: any) => Promise<AiInteraction | null>;
  createAlignmentGapAnalysis: (data: any) => Promise<AiInteraction | null>;
  submitFeedback: (interactionId: string, rating: number, content?: string, feedbackType?: string) => Promise<boolean>;
  
  // Review actions
  submitReview: (interactionId: string, status: ReviewStatus, feedback?: string) => void;
  getPendingReviews: () => AiInteraction[];
  
  // Helpers
  getFilteredInteractions: () => AiInteraction[];
  getInteractionsByUser: (userId: string) => AiInteraction[];
  getInteractionsByFeature: (featureType: AiFeatureType) => AiInteraction[];
}

// Create the AI store
export const useAiStore = create<AiState>((set, get) => ({
  // Initial state
  interactions: [],
  currentInteraction: null,
  interactionStatus: 'idle',
  interactionError: null,
  pendingReviews: [],
  featureFilter: 'all',
  reviewStatusFilter: 'all',
  
  // Basic state actions implementation
  addInteraction: (interaction) => {
    const updatedInteractions = [...get().interactions, interaction];
    
    set({
      interactions: updatedInteractions,
      // If it's pending review, add to pending reviews
      pendingReviews: interaction.reviewStatus === 'pending' 
        ? [...get().pendingReviews, interaction] 
        : get().pendingReviews
    });
  },
  
  removeInteraction: (id) => {
    const updatedInteractions = get().interactions.filter(
      interaction => interaction.id !== id
    );
    
    const updatedPendingReviews = get().pendingReviews.filter(
      interaction => interaction.id !== id
    );
    
    set({
      interactions: updatedInteractions,
      pendingReviews: updatedPendingReviews
    });
  },
  
  setCurrentInteraction: (interaction) => {
    set({ currentInteraction: interaction });
  },
  
  setInteractionStatus: (status, error = null) => {
    set({
      interactionStatus: status,
      interactionError: error
    });
  },
  
  updateInteraction: (id, updates) => {
    const interactions = get().interactions.map(interaction => 
      interaction.id === id 
        ? { ...interaction, ...updates } 
        : interaction
    );
    
    // If review status changed, update pending reviews
    let pendingReviews = [...get().pendingReviews];
    if (updates.reviewStatus) {
      if (updates.reviewStatus !== 'pending') {
        // Remove from pending if it's been reviewed
        pendingReviews = pendingReviews.filter(interaction => interaction.id !== id);
      } else {
        // Add to pending if it's now pending
        const interaction = interactions.find(i => i.id === id);
        if (interaction && !pendingReviews.some(i => i.id === id)) {
          pendingReviews.push(interaction);
        }
      }
    }
    
    set({ 
      interactions, 
      pendingReviews 
    });
  },
  
  setFeatureFilter: (filter) => {
    set({ featureFilter: filter });
  },
  
  setReviewStatusFilter: (filter) => {
    set({ reviewStatusFilter: filter });
  },
  
  // API Actions implementation
  submitRegulatoryQuery: async (query, documentIds) => {
    try {
      set({ 
        interactionStatus: 'loading',
        interactionError: null 
      });
      
      const response = await aiApi.regulatoryQa(query, documentIds) as ApiResponse<{ interaction: AiInteraction }>;
      
      if (!response.success || !response.data?.interaction) {
        set({ 
          interactionStatus: 'error',
          interactionError: response.message || 'Failed to process regulatory query'
        });
        return null;
      }
      
      // Convert date strings to Date objects
      const interaction = {
        ...response.data.interaction,
        createdAt: new Date(response.data.interaction.createdAt),
        reviewedAt: response.data.interaction.reviewedAt 
          ? new Date(response.data.interaction.reviewedAt) 
          : undefined
      };
      
      // Add interaction to state
      get().addInteraction(interaction);
      
      set({ 
        interactionStatus: 'success',
        currentInteraction: interaction
      });
      
      return interaction;
    } catch (error) {
      set({
        interactionStatus: 'error',
        interactionError: error instanceof Error ? error.message : 'Error processing query'
      });
      return null;
    }
  },
  
  submitContractReview: async (contractId, regulatoryIds) => {
    try {
      set({ 
        interactionStatus: 'loading',
        interactionError: null 
      });
      
      const response = await aiApi.contractReview(contractId, regulatoryIds) as ApiResponse<{ interaction: AiInteraction, analysisResult?: any }>;
      
      if (!response.success || !response.data?.interaction) {
        set({ 
          interactionStatus: 'error',
          interactionError: response.message || 'Failed to analyze contract'
        });
        return null;
      }
      
      // Convert date strings to Date objects
      const interaction = {
        ...response.data.interaction,
        createdAt: new Date(response.data.interaction.createdAt),
        reviewedAt: response.data.interaction.reviewedAt 
          ? new Date(response.data.interaction.reviewedAt) 
          : undefined,
        // Add analysis result as part of context if available
        context: {
          ...response.data.interaction.context,
          analysisResult: response.data.analysisResult || undefined
        }
      };
      
      // Add interaction to state
      get().addInteraction(interaction);
      
      set({ 
        interactionStatus: 'success',
        currentInteraction: interaction
      });
      
      return interaction;
    } catch (error) {
      set({
        interactionStatus: 'error',
        interactionError: error instanceof Error ? error.message : 'Error analyzing contract'
      });
      return null;
    }
  },
  
  createSummarization: async (documentId, options) => {
    try {
      set({ 
        interactionStatus: 'loading',
        interactionError: null 
      });
      
      const response = await aiApi.summarization(documentId, options) as ApiResponse<{ interaction: AiInteraction, summary?: string }>;
      
      if (!response.success || !response.data?.interaction) {
        set({ 
          interactionStatus: 'error',
          interactionError: response.message || 'Failed to summarize document'
        });
        return null;
      }
      
      // Convert date strings to Date objects
      const interaction = {
        ...response.data.interaction,
        createdAt: new Date(response.data.interaction.createdAt),
        reviewedAt: response.data.interaction.reviewedAt 
          ? new Date(response.data.interaction.reviewedAt) 
          : undefined
      };
      
      // Add interaction to state
      get().addInteraction(interaction);
      
      set({ 
        interactionStatus: 'success',
        currentInteraction: interaction
      });
      
      return interaction;
    } catch (error) {
      set({
        interactionStatus: 'error',
        interactionError: error instanceof Error ? error.message : 'Error summarizing document'
      });
      return null;
    }
  },
  
  createComparison: async (documentIds, comparisonType) => {
    try {
      set({ 
        interactionStatus: 'loading',
        interactionError: null 
      });
      
      const response = await aiApi.comparison(documentIds, comparisonType) as ApiResponse<{ interaction: AiInteraction, comparisonResult?: any }>;
      
      if (!response.success || !response.data?.interaction) {
        set({ 
          interactionStatus: 'error',
          interactionError: response.message || 'Failed to compare documents'
        });
        return null;
      }
      
      // Convert date strings to Date objects
      const interaction = {
        ...response.data.interaction,
        createdAt: new Date(response.data.interaction.createdAt),
        reviewedAt: response.data.interaction.reviewedAt 
          ? new Date(response.data.interaction.reviewedAt) 
          : undefined,
        // Add comparison result as part of context
        context: {
          ...response.data.interaction.context,
          comparisonResult: response.data.comparisonResult || undefined
        }
      };
      
      // Add interaction to state
      get().addInteraction(interaction);
      
      set({ 
        interactionStatus: 'success',
        currentInteraction: interaction
      });
      
      return interaction;
    } catch (error) {
      set({
        interactionStatus: 'error',
        interactionError: error instanceof Error ? error.message : 'Error comparing documents'
      });
      return null;
    }
  },
  
  createPolicyDraft: async (data) => {
    try {
      set({ 
        interactionStatus: 'loading',
        interactionError: null 
      });
      
      const response = await aiApi.policyDrafting(data) as ApiResponse<{ interaction: AiInteraction, policyDocument?: any }>;
      
      if (!response.success || !response.data?.interaction) {
        set({ 
          interactionStatus: 'error',
          interactionError: response.message || 'Failed to draft policy'
        });
        return null;
      }
      
      // Convert date strings to Date objects
      const interaction = {
        ...response.data.interaction,
        createdAt: new Date(response.data.interaction.createdAt),
        reviewedAt: response.data.interaction.reviewedAt 
          ? new Date(response.data.interaction.reviewedAt) 
          : undefined
      };
      
      // Add interaction to state
      get().addInteraction(interaction);
      
      set({ 
        interactionStatus: 'success',
        currentInteraction: interaction
      });
      
      return interaction;
    } catch (error) {
      set({
        interactionStatus: 'error',
        interactionError: error instanceof Error ? error.message : 'Error drafting policy'
      });
      return null;
    }
  },
  
  createControlDesign: async (data) => {
    try {
      set({ 
        interactionStatus: 'loading',
        interactionError: null 
      });
      
      const response = await aiApi.controlDesign(data) as ApiResponse<{ interaction: AiInteraction, controlDocument?: any }>;
      
      if (!response.success || !response.data?.interaction) {
        set({ 
          interactionStatus: 'error',
          interactionError: response.message || 'Failed to design control'
        });
        return null;
      }
      
      // Convert date strings to Date objects
      const interaction = {
        ...response.data.interaction,
        createdAt: new Date(response.data.interaction.createdAt),
        reviewedAt: response.data.interaction.reviewedAt 
          ? new Date(response.data.interaction.reviewedAt) 
          : undefined
      };
      
      // Add interaction to state
      get().addInteraction(interaction);
      
      set({ 
        interactionStatus: 'success',
        currentInteraction: interaction
      });
      
      return interaction;
    } catch (error) {
      set({
        interactionStatus: 'error',
        interactionError: error instanceof Error ? error.message : 'Error designing control'
      });
      return null;
    }
  },
  
  createAlignmentGapAnalysis: async (data) => {
    try {
      set({ 
        interactionStatus: 'loading',
        interactionError: null 
      });
      
      const response = await aiApi.alignmentGap(data) as ApiResponse<{ interaction: AiInteraction, analysis?: any }>;
      
      if (!response.success || !response.data?.interaction) {
        set({ 
          interactionStatus: 'error',
          interactionError: response.message || 'Failed to analyze alignment'
        });
        return null;
      }
      
      // Convert date strings to Date objects
      const interaction = {
        ...response.data.interaction,
        createdAt: new Date(response.data.interaction.createdAt),
        reviewedAt: response.data.interaction.reviewedAt 
          ? new Date(response.data.interaction.reviewedAt) 
          : undefined,
        // Add analysis result as part of context
        context: {
          ...response.data.interaction.context,
          analysis: response.data.analysis || undefined
        }
      };
      
      // Add interaction to state
      get().addInteraction(interaction);
      
      set({ 
        interactionStatus: 'success',
        currentInteraction: interaction
      });
      
      return interaction;
    } catch (error) {
      set({
        interactionStatus: 'error',
        interactionError: error instanceof Error ? error.message : 'Error analyzing alignment'
      });
      return null;
    }
  },
  
  submitFeedback: async (interactionId, rating, content, feedbackType = 'interaction') => {
    try {
      set({ interactionStatus: 'loading' });
      
      const response = await aiApi.submitFeedback(interactionId, rating, content) as ApiResponse<{ feedback: any }>;
      
      if (!response.success) {
        set({ 
          interactionStatus: 'error',
          interactionError: response.message || 'Failed to submit feedback'
        });
        return false;
      }
      
      // Update the interaction with reviewed status
      get().updateInteraction(interactionId, {
        reviewStatus: 'needs-review' as ReviewStatus,
        reviewerFeedback: content || undefined,
        reviewedAt: new Date()
      });
      
      set({ interactionStatus: 'success' });
      return true;
    } catch (error) {
      set({
        interactionStatus: 'error',
        interactionError: error instanceof Error ? error.message : 'Error submitting feedback'
      });
      return false;
    }
  },
  
  // Review actions implementation
  submitReview: (interactionId, status, feedback = '') => {
    const updatedInteractions = get().interactions.map(interaction => {
      if (interaction.id === interactionId) {
        return {
          ...interaction,
          reviewStatus: status,
          reviewerFeedback: feedback,
          reviewedAt: new Date()
        };
      }
      return interaction;
    });
    
    // Remove from pending reviews
    const updatedPendingReviews = get().pendingReviews.filter(
      interaction => interaction.id !== interactionId
    );
    
    set({
      interactions: updatedInteractions,
      pendingReviews: updatedPendingReviews
    });
  },
  
  getPendingReviews: () => {
    return get().interactions.filter(
      interaction => interaction.reviewStatus === 'pending'
    );
  },
  
  // Helper implementations
  getFilteredInteractions: () => {
    const { interactions, featureFilter, reviewStatusFilter } = get();
    
    return interactions.filter(interaction => {
      // Apply feature filter
      if (featureFilter !== 'all' && interaction.featureType !== featureFilter) {
        return false;
      }
      
      // Apply review status filter
      if (reviewStatusFilter !== 'all' && interaction.reviewStatus !== reviewStatusFilter) {
        return false;
      }
      
      return true;
    });
  },
  
  getInteractionsByUser: (userId) => {
    return get().interactions.filter(
      interaction => interaction.userId === userId
    );
  },
  
  getInteractionsByFeature: (featureType) => {
    return get().interactions.filter(
      interaction => interaction.featureType === featureType
    );
  }
})); 