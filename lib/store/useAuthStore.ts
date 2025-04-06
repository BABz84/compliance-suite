import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UIStatus } from './useUIState';

// User role type based on PRD
export type UserRole = 'analyst' | 'sme' | 'manager' | 'admin';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  lastLogin?: Date;
}

// Auth state interface
interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;
  authStatus: UIStatus;
  authError: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setAuthStatus: (status: UIStatus, error?: string | null) => void;
  
  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

// Mock login function - in production, this would call an actual API
const mockLogin = async (email: string, password: string): Promise<User | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Demo users based on personas in PRD
  const demoUsers: Record<string, User> = {
    'chris@example.com': {
      id: '1',
      email: 'chris@example.com',
      name: 'Chris (Analyst)',
      role: 'analyst',
      permissions: ['read:documents', 'upload:documents', 'use:ai'],
      lastLogin: new Date()
    },
    'linda@example.com': {
      id: '2',
      email: 'linda@example.com',
      name: 'Linda (SME)',
      role: 'sme',
      permissions: ['read:documents', 'upload:documents', 'use:ai', 'validate:ai', 'feedback:ai'],
      lastLogin: new Date()
    },
    'maria@example.com': {
      id: '3',
      email: 'maria@example.com',
      name: 'Maria (Manager)',
      role: 'manager',
      permissions: ['read:documents', 'upload:documents', 'use:ai', 'validate:ai', 'feedback:ai', 'view:reports', 'view:logs'],
      lastLogin: new Date()
    }
  };
  
  // For demo, any password works for demo users
  if (Object.keys(demoUsers).includes(email)) {
    return demoUsers[email];
  }
  
  return null;
};

// Create the auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      authStatus: 'idle',
      authError: null,
      
      // Action implementations
      login: async (email, password) => {
        try {
          set({ authStatus: 'loading', authError: null });
          
          const user = await mockLogin(email, password);
          
          if (!user) {
            set({ 
              authStatus: 'error', 
              authError: 'Invalid email or password'
            });
            return;
          }
          
          set({ 
            isAuthenticated: true,
            user,
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
        set({ 
          isAuthenticated: false,
          user: null,
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
      
      // Permission helper implementations
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
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
        user: state.user
      })
    }
  )
); 