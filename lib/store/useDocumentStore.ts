import { create } from 'zustand';
import { UIStatus } from './useUIState';

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