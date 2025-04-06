"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDocumentStore, useUIState, DocumentType, Jurisdiction } from "@/lib/store"
import { Upload, Loader2, FileText } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface DocumentUploaderProps {
  documentType?: DocumentType | 'all'
  onSuccess?: () => void
}

export function DocumentUploader({ 
  documentType = "all", 
  onSuccess 
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const { addDocument, uploadStatus, uploadError, setUploadStatus } = useDocumentStore()
  const { triggerEvent } = useUIState()
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }, [])
  
  const handleUpload = useCallback(async () => {
    if (!file) return
    
    // Start upload process
    setUploadStatus('loading')
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create a new document
      const newDocument = {
        id: uuidv4(),
        name: file.name,
        type: documentType === 'all' ? 'contract' as DocumentType : documentType as DocumentType,
        tags: [documentType === 'all' ? 'document' : documentType],
        uploadDate: new Date(),
        processingStatus: 'completed' as const,
        fileUrl: URL.createObjectURL(file),
        size: file.size,
        contentType: file.type,
        jurisdiction: 'federal' as Jurisdiction
      }
      
      // Add to document store
      addDocument(newDocument)
      
      // Signal success
      setUploadStatus('success')
      
      // Trigger document-added event for other components to respond
      triggerEvent('document-added')
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess()
      
      // Reset file
      setFile(null)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error', 'Failed to upload document')
    }
  }, [file, documentType, addDocument, setUploadStatus, triggerEvent, onSuccess])
  
  const isLoading = uploadStatus === 'loading'
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="document-file">Upload Document</Label>
        <Input 
          id="document-file" 
          type="file" 
          onChange={handleFileChange} 
          disabled={isLoading}
        />
      </div>
      
      {file && !isLoading && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <FileText className="h-4 w-4" />
          <span className="text-sm truncate">{file.name}</span>
        </div>
      )}
      
      {uploadError && (
        <p className="text-sm text-destructive">{uploadError}</p>
      )}
      
      <Button 
        onClick={handleUpload} 
        disabled={!file || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </>
        )}
      </Button>
    </div>
  )
} 