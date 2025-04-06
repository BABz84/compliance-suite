import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UIStatus } from './useUIState';
import { authApi, apiClient, ApiResponse } from '../api-client';

// User role type based on PRD
export type UserRole = 'analyst' | 'sme' | 'manager' | 'admin';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions?: string[];
  lastLoginAt?: Date;
}

// Auth response interface for type safety
interface AuthResponse {
  user: User;
  token: string;
}

// Auth state interface
interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  authStatus: UIStatus;
  authError: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAuthStatus: (status: UIStatus, error?: string | null) => void;
  checkSession: () => Promise<boolean>;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// Standard permissions for each role
const rolePermissions: Record<UserRole, string[]> = {
  analyst: ['read:documents', 'upload:documents', 'use:ai'],
  sme: ['read:documents', 'upload:documents', 'use:ai', 'validate:ai', 'feedback:ai'],
  manager: ['read:documents', 'upload:documents', 'use:ai', 'validate:ai', 'feedback:ai', 'view:reports', 'view:logs'],
  admin: ['read:documents', 'upload:documents', 'use:ai', 'validate:ai', 'feedback:ai', 'view:reports', 'view:logs', 'manage:users']
};

// Create the auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      authStatus: 'idle',
      authError: null,
      
      // Action implementations
      login: async (email, password) => {
        try {
          set({ authStatus: 'loading', authError: null });
          
          const response = await authApi.login(email, password) as ApiResponse<AuthResponse>;
          
          if (!response.success || !response.data?.token || !response.data?.user) {
            set({ 
              authStatus: 'error', 
              authError: response.message || 'Authentication failed'
            });
            return;
          }
          
          // Add standard permissions based on role if not provided
          const user = {
            ...response.data.user,
            permissions: response.data.user.permissions || rolePermissions[response.data.user.role as UserRole] || []
          };
          
          // Update API client with token
          apiClient.setToken(response.data.token);
          
          set({ 
            isAuthenticated: true,
            user,
            token: response.data.token,
            authStatus: 'success'
          });
          
        } catch (error) {
          set({ 
            authStatus: 'error', 
            authError: error instanceof Error ? error.message : 'Authentication failed'
          });
        }
      },
      
      logout: () => {
        authApi.logout();
        set({ 
          isAuthenticated: false,
          user: null,
          token: null,
          authStatus: 'idle',
          authError: null
        });
      },
      
      setUser: (user) => {
        set({ 
          user,
          isAuthenticated: !!user
        });
      },
      
      setAuthStatus: (status, error = null) => {
        set({ authStatus: status, authError: error });
      },
      
      checkSession: async () => {
        const { token, isAuthenticated } = get();
        
        // If no token or already authenticated, no need to check
        if (!token || isAuthenticated) {
          return isAuthenticated;
        }
        
        try {
          set({ authStatus: 'loading' });
          
          // Set the token in the API client
          apiClient.setToken(token);
          
          // Verify the session with the backend
          const response = await authApi.verifySession() as ApiResponse<{ user: User }>;
          
          if (!response.success || !response.data?.user) {
            // Session is invalid, clear the auth state
            set({ 
              isAuthenticated: false,
              user: null,
              token: null,
              authStatus: 'error', 
              authError: 'Session expired'
            });
            return false;
          }
          
          // Add standard permissions based on role if not provided
          const user = {
            ...response.data.user,
            permissions: response.data.user.permissions || rolePermissions[response.data.user.role as UserRole] || []
          };
          
          // Session is valid, update user data
          set({ 
            isAuthenticated: true,
            user,
            authStatus: 'success'
          });
          
          return true;
        } catch (error) {
          // Error checking session, clear auth state
          set({ 
            isAuthenticated: false,
            user: null,
            token: null,
            authStatus: 'error', 
            authError: 'Failed to verify session'
          });
          return false;
        }
      },
      
      // Permission helper implementations
      hasPermission: (permission) => {
        const { user } = get();
        if (!user || !user.permissions) return false;
        return user.permissions.includes(permission);
      },
      
      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        
        return user.role === role;
      }
    }),
    {
      name: 'compliance-auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token
      })
    }
  )
); 