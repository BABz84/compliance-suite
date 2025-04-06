import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Define API response structure for type safety
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Create the base API client
class BaseApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  
  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });
    
    // Add a response transformer instead of using interceptors
    this.client.defaults.transformResponse = [...(axios.defaults.transformResponse as any[]), 
      (data: any, headers: any, status: number) => {
        // Already transformed to an object by axios default transformer
        return {
          success: true,
          data: data.data || data,
          message: data.message || '',
          statusCode: status
        } as ApiResponse;
      }
    ];
    
    // Add error handler
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout,
      validateStatus: (status) => true, // Accept all status codes so we can format them
    });
  }
  
  // Set auth token to be used in subsequent requests
  setAuthToken(token: string | null) {
    this.authToken = token;
    
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }
  
  // Helper to process responses and errors consistently
  private async processRequest<T>(requestPromise: Promise<AxiosResponse>): Promise<ApiResponse<T>> {
    try {
      const response = await requestPromise;
      
      if (response.status >= 200 && response.status < 300) {
        const responseData = response.data || {};
        return {
          success: true,
          data: responseData.data || responseData,
          message: responseData.message || '',
          statusCode: response.status
        };
      } else {
        const responseData = response.data || {};
        return {
          success: false,
          message: responseData.message || 'Request failed',
          errors: responseData.errors || {},
          statusCode: response.status
        };
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      const responseData = axiosError.response?.data as Record<string, any> || {};
      return {
        success: false,
        message: responseData.message || axiosError.message || 'An unexpected error occurred',
        errors: responseData.errors || {},
        statusCode: axiosError.response?.status || 500
      };
    }
  }
  
  // Base request methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.processRequest<T>(this.client.get(url, config));
  }
  
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.processRequest<T>(this.client.post(url, data, config));
  }
  
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.processRequest<T>(this.client.put(url, data, config));
  }
  
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.processRequest<T>(this.client.delete(url, config));
  }
  
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.processRequest<T>(this.client.patch(url, data, config));
  }
}

// Create a singleton instance of the API client
export const apiClient = new BaseApiClient();

// Authentication API service
export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.post('/auth/login', { email, password });
  },
  
  verifySession: async () => {
    return apiClient.get('/auth/session');
  },
  
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
  
  register: async (userData: any) => {
    return apiClient.post('/auth/register', userData);
  },
  
  forgotPassword: async (email: string) => {
    return apiClient.post('/auth/forgot-password', { email });
  },
  
  resetPassword: async (token: string, password: string) => {
    return apiClient.post('/auth/reset-password', { token, password });
  },
};

// Documents API service
export const documentsApi = {
  getAll: async (filters?: Record<string, any>) => {
    return apiClient.get('/documents', { params: filters });
  },
  
  getById: async (id: string) => {
    return apiClient.get(`/documents/${id}`);
  },
  
  create: async (formData: FormData) => {
    return apiClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  update: async (id: string, data: any) => {
    return apiClient.put(`/documents/${id}`, data);
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`/documents/${id}`);
  },
  
  process: async (id: string, options?: any) => {
    return apiClient.post(`/documents/${id}/process`, options);
  },
};

// AI API service
export const aiApi = {
  // Base AI Interaction methods
  getInteractions: async (filters?: Record<string, any>) => {
    return apiClient.get('/ai/interactions', { params: filters });
  },
  
  getInteractionById: async (id: string) => {
    return apiClient.get(`/ai/interactions/${id}`);
  },
  
  deleteInteraction: async (id: string) => {
    return apiClient.delete(`/ai/interactions/${id}`);
  },
  
  // Feature-specific endpoints
  regulatoryQa: async (query: string, documentIds?: string[]) => {
    return apiClient.post('/ai/regulatory-qa', { 
      query, 
      documentIds 
    });
  },
  
  contractReview: async (contractId: string, regulatoryIds?: string[]) => {
    return apiClient.post('/ai/contract-review', { 
      contractId, 
      regulatoryIds 
    });
  },
  
  summarization: async (documentId: string, options?: any) => {
    return apiClient.post('/ai/summarization', { 
      documentId, 
      options 
    });
  },
  
  comparison: async (documentIds: string[], comparisonType?: string) => {
    return apiClient.post('/ai/comparison', { 
      documentIds, 
      comparisonType 
    });
  },
  
  policyDrafting: async (data: any) => {
    return apiClient.post('/ai/policy-drafting', data);
  },
  
  controlDesign: async (data: any) => {
    return apiClient.post('/ai/control-design', data);
  },
  
  alignmentGap: async (data: any) => {
    return apiClient.post('/ai/alignment-gap', data);
  },
  
  // Feedback methods
  submitFeedback: async (interactionId: string, rating: number, content?: string) => {
    return apiClient.post(`/ai/interactions/${interactionId}/feedback`, {
      rating,
      content
    });
  },
};

// User API service
export const userApi = {
  getCurrentUser: async () => {
    return apiClient.get('/users/me');
  },
  
  updateProfile: async (data: any) => {
    return apiClient.put('/users/me', data);
  },
  
  getAllUsers: async (filters?: Record<string, any>) => {
    return apiClient.get('/users', { params: filters });
  },
  
  getUserById: async (id: string) => {
    return apiClient.get(`/users/${id}`);
  },
};

// Export combined API
export const api = {
  client: apiClient,
  auth: authApi,
  documents: documentsApi,
  ai: aiApi,
  users: userApi,
}; 