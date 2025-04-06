import { create } from 'zustand';
import { UIStatus } from './useUIState';

// AI feature type based on PRD
export type AiFeatureType = 
  | 'regulatory-qa' 
  | 'summarization' 
  | 'jurisdictional-comparison' 
  | 'contract-review' 
  | 'policy-drafting' 
  | 'control-design' 
  | 'alignment-gap-detection';

// SME review status
export type ReviewStatus = 'pending' | 'accurate' | 'inaccurate' | 'needs-review';

// AI interaction interface
export interface AiInteraction {
  id: string;
  featureType: AiFeatureType;
  userId: string;
  userRole: string;
  prompt: string;
  context?: Record<string, any>;
  response: string;
  createdAt: Date;
  reviewStatus: ReviewStatus;
  reviewerId?: string;
  reviewerFeedback?: string;
  reviewedAt?: Date;
  sourceCitations?: string[];
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
  
  // Actions
  addInteraction: (interaction: AiInteraction) => void;
  removeInteraction: (id: string) => void;
  setCurrentInteraction: (interaction: AiInteraction | null) => void;
  setInteractionStatus: (status: UIStatus, error?: string | null) => void;
  updateInteraction: (id: string, updates: Partial<AiInteraction>) => void;
  setFeatureFilter: (filter: AiFeatureType | 'all') => void;
  setReviewStatusFilter: (filter: ReviewStatus | 'all') => void;
  
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
  
  // Actions implementation
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