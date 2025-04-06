import { create } from 'zustand';
import { UIStatus } from './useUIState';
import { documentsApi, ApiResponse } from '../api-client';

// Document type definitions based on PRD
export type DocumentType = 'regulation' | 'contract' | 'policy' | 'control' | 'disclosure';
export type Jurisdiction = 'federal' | 'state' | 'international' | 'unknown';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  jurisdiction?: Jurisdiction;
  tags: string[];
  uploadDate: Date;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl: string;
  size: number;
  contentType: string;
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

// Document store state interface
interface DocumentState {
  // Document collections
  documents: Document[];
  filteredDocuments: Document[];
  selectedDocument: Document | null;
  
  // UI state for document operations
  uploadStatus: UIStatus;
  uploadProgress: number;
  uploadError: string | null;
  processingStatus: UIStatus;
  searchQuery: string;
  documentTypeFilter: DocumentType | 'all';
  jurisdictionFilter: Jurisdiction | 'all';
  
  // Actions
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  removeDocument: (id: string) => void;
  selectDocument: (id: string | null) => void;
  setUploadStatus: (status: UIStatus, error?: string | null) => void;
  setUploadProgress: (progress: number) => void;
  setProcessingStatus: (status: UIStatus) => void;
  setSearchQuery: (query: string) => void;
  setDocumentTypeFilter: (type: DocumentType | 'all') => void;
  setJurisdictionFilter: (jurisdiction: Jurisdiction | 'all') => void;
  
  // API actions
  fetchDocuments: (type?: DocumentType) => Promise<void>;
  fetchDocumentById: (id: string) => Promise<Document | null>;
  createDocument: (documentData: Partial<Document>) => Promise<Document | null>;
  updateDocument: (id: string, updateData: Partial<Document>) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<boolean>;
  processDocument: (id: string) => Promise<boolean>;
  
  // Filter helper
  applyFilters: () => void;
}

// Create the document store
export const useDocumentStore = create<DocumentState>((set, get) => ({
  // Initial state
  documents: [],
  filteredDocuments: [],
  selectedDocument: null,
  uploadStatus: 'idle',
  uploadProgress: 0,
  uploadError: null,
  processingStatus: 'idle',
  searchQuery: '',
  documentTypeFilter: 'all',
  jurisdictionFilter: 'all',
  
  // Actions implementation
  setDocuments: (documents) => {
    set({ 
      documents,
      filteredDocuments: documents 
    });
    get().applyFilters();
  },
  
  addDocument: (document) => {
    const updatedDocuments = [...get().documents, document];
    set({ documents: updatedDocuments });
    get().applyFilters();
  },
  
  removeDocument: (id) => {
    const updatedDocuments = get().documents.filter(doc => doc.id !== id);
    set({ documents: updatedDocuments });
    get().applyFilters();
  },
  
  selectDocument: (id) => {
    if (id === null) {
      set({ selectedDocument: null });
      return;
    }
    
    const document = get().documents.find(doc => doc.id === id) || null;
    set({ selectedDocument: document });
  },
  
  setUploadStatus: (status, error = null) => {
    set({ 
      uploadStatus: status,
      uploadError: error
    });
    
    // Reset progress on completion or error
    if (status === 'success' || status === 'error') {
      setTimeout(() => {
        set({ uploadProgress: 0 });
      }, 1000);
    }
  },
  
  setUploadProgress: (progress) => {
    set({ uploadProgress: progress });
  },
  
  setProcessingStatus: (status) => {
    set({ processingStatus: status });
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },
  
  setDocumentTypeFilter: (type) => {
    set({ documentTypeFilter: type });
    get().applyFilters();
  },
  
  setJurisdictionFilter: (jurisdiction) => {
    set({ jurisdictionFilter: jurisdiction });
    get().applyFilters();
  },
  
  // API actions implementation
  fetchDocuments: async (type) => {
    try {
      set({ uploadStatus: 'loading' });
      const response = await documentsApi.getAll(type) as ApiResponse<{ documents: Document[] }>;
      
      if (!response.success || !response.data?.documents) {
        set({ 
          uploadStatus: 'error', 
          uploadError: response.message || 'Failed to fetch documents' 
        });
        return;
      }
      
      // Convert date strings to Date objects
      const documents = response.data.documents.map(doc => ({
        ...doc,
        uploadDate: new Date(doc.uploadDate)
      }));
      
      set({ 
        documents,
        uploadStatus: 'success'
      });
      
      get().applyFilters();
    } catch (error) {
      set({
        uploadStatus: 'error',
        uploadError: error instanceof Error ? error.message : 'Error fetching documents'
      });
    }
  },
  
  fetchDocumentById: async (id) => {
    try {
      set({ uploadStatus: 'loading' });
      const response = await documentsApi.getById(id) as ApiResponse<{ document: Document }>;
      
      if (!response.success || !response.data?.document) {
        set({ 
          uploadStatus: 'error', 
          uploadError: response.message || 'Failed to fetch document' 
        });
        return null;
      }
      
      // Convert date strings to Date objects
      const document = {
        ...response.data.document,
        uploadDate: new Date(response.data.document.uploadDate)
      };
      
      set({ uploadStatus: 'success' });
      return document;
    } catch (error) {
      set({
        uploadStatus: 'error',
        uploadError: error instanceof Error ? error.message : 'Error fetching document'
      });
      return null;
    }
  },
  
  createDocument: async (documentData) => {
    try {
      set({ uploadStatus: 'loading' });
      const response = await documentsApi.create(documentData) as ApiResponse<{ document: Document }>;
      
      if (!response.success || !response.data?.document) {
        set({ 
          uploadStatus: 'error', 
          uploadError: response.message || 'Failed to create document' 
        });
        return null;
      }
      
      // Convert date strings to Date objects
      const document = {
        ...response.data.document,
        uploadDate: new Date(response.data.document.uploadDate)
      };
      
      // Add the new document to the state
      get().addDocument(document);
      
      set({ uploadStatus: 'success' });
      return document;
    } catch (error) {
      set({
        uploadStatus: 'error',
        uploadError: error instanceof Error ? error.message : 'Error creating document'
      });
      return null;
    }
  },
  
  updateDocument: async (id, updateData) => {
    try {
      set({ uploadStatus: 'loading' });
      const response = await documentsApi.update(id, updateData) as ApiResponse<{ document: Document }>;
      
      if (!response.success || !response.data?.document) {
        set({ 
          uploadStatus: 'error', 
          uploadError: response.message || 'Failed to update document' 
        });
        return null;
      }
      
      // Convert date strings to Date objects
      const document = {
        ...response.data.document,
        uploadDate: new Date(response.data.document.uploadDate)
      };
      
      // Update document in state
      const updatedDocuments = get().documents.map(doc => 
        doc.id === id ? document : doc
      );
      
      set({ 
        documents: updatedDocuments,
        uploadStatus: 'success'
      });
      
      get().applyFilters();
      
      return document;
    } catch (error) {
      set({
        uploadStatus: 'error',
        uploadError: error instanceof Error ? error.message : 'Error updating document'
      });
      return null;
    }
  },
  
  deleteDocument: async (id) => {
    try {
      set({ uploadStatus: 'loading' });
      const response = await documentsApi.delete(id) as ApiResponse<{ success: boolean }>;
      
      if (!response.success) {
        set({ 
          uploadStatus: 'error', 
          uploadError: response.message || 'Failed to delete document' 
        });
        return false;
      }
      
      // Remove document from state
      get().removeDocument(id);
      
      set({ uploadStatus: 'success' });
      return true;
    } catch (error) {
      set({
        uploadStatus: 'error',
        uploadError: error instanceof Error ? error.message : 'Error deleting document'
      });
      return false;
    }
  },
  
  processDocument: async (id) => {
    try {
      set({ processingStatus: 'loading' });
      const response = await documentsApi.process(id) as ApiResponse<{ success: boolean }>;
      
      if (!response.success) {
        set({ processingStatus: 'error' });
        return false;
      }
      
      // Update the document processing status in state
      const updatedDocuments = get().documents.map(doc => {
        if (doc.id === id) {
          return { ...doc, processingStatus: 'processing' as const };
        }
        return doc;
      });
      
      set({ 
        documents: updatedDocuments,
        processingStatus: 'success' 
      });
      
      get().applyFilters();
      
      return true;
    } catch (error) {
      set({ processingStatus: 'error' });
      return false;
    }
  },
  
  // Filter helper implementation
  applyFilters: () => {
    const { 
      documents, 
      searchQuery, 
      documentTypeFilter, 
      jurisdictionFilter 
    } = get();
    
    let filtered = [...documents];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(query) || 
        doc.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply document type filter
    if (documentTypeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === documentTypeFilter);
    }
    
    // Apply jurisdiction filter
    if (jurisdictionFilter !== 'all') {
      filtered = filtered.filter(doc => doc.jurisdiction === jurisdictionFilter);
    }
    
    set({ filteredDocuments: filtered });
  }
})); 