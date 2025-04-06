import { create } from 'zustand';

// Type definitions for UI state
export type UIStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error';

interface UIState {
  // General UI state
  status: UIStatus;
  error: string | null;
  message: string | null;
  pageTitle: string;

  // State mutation actions
  setStatus: (status: UIStatus) => void;
  setError: (error: string | null) => void;
  setMessage: (message: string | null) => void;
  setPageTitle: (title: string) => void;
  reset: () => void;
  
  // Convenience methods for common state transitions
  startLoading: () => void;
  startProcessing: () => void;
  setSuccess: (message?: string) => void;
  setFailed: (error: string) => void;
  
  // Event system for cross-component communication
  events: Record<string, Date>;
  triggerEvent: (eventName: string) => void;
  getLastEventTime: (eventName: string) => Date | null;
}

// Create the store with type safety
export const useUIState = create<UIState>((set, get) => ({
  // Initial state
  status: 'idle',
  error: null,
  message: null,
  pageTitle: 'Dashboard',
  events: {},

  // State mutation implementations
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setMessage: (message) => set({ message }),
  setPageTitle: (pageTitle) => set({ pageTitle }),
  reset: () => set({ status: 'idle', error: null, message: null }),
  
  // Convenience methods implementation
  startLoading: () => set({ status: 'loading', error: null, message: null }),
  startProcessing: () => set({ status: 'processing', error: null, message: null }),
  setSuccess: (message) => set({ 
    status: 'success', 
    error: null, 
    message: message || 'Operation completed successfully' 
  }),
  setFailed: (error) => set({ 
    status: 'error', 
    error: error || 'An error occurred', 
    message: null 
  }),
  
  // Event system implementation
  triggerEvent: (eventName) => set(state => ({
    events: {
      ...state.events,
      [eventName]: new Date()
    }
  })),
  getLastEventTime: (eventName) => get().events[eventName] || null
})); 