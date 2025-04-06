"use client";

import { useState, useCallback } from 'react';
import { useDocumentStore, DocumentType, Jurisdiction } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

// Mock function to simulate file upload
const mockUploadFile = async (
  file: File, 
  type: DocumentType,
  jurisdiction: Jurisdiction,
  tags: string[],
  onProgress: (progress: number) => void
): Promise<{ id: string; fileUrl: string }> => {
  // Simulate upload progress
  for (let progress = 0; progress <= 100; progress += 10) {
    onProgress(progress);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // Return mock file info
  return {
    id: `doc-${Date.now()}`,
    fileUrl: URL.createObjectURL(file)
  };
};

export function DocumentUpload() {
  const { 
    addDocument, 
    uploadStatus, 
    uploadProgress, 
    uploadError, 
    setUploadStatus, 
    setUploadProgress 
  } = useDocumentStore();
  
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('regulation');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('federal');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }, []);
  
  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);
  
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setUploadStatus('error', 'Please select a file to upload');
      return;
    }
    
    setUploadStatus('loading');
    
    try {
      // Upload file
      const { id, fileUrl } = await mockUploadFile(
        file,
        documentType,
        jurisdiction,
        tags,
        setUploadProgress
      );
      
      // Add document to store
      addDocument({
        id,
        name: file.name,
        type: documentType,
        jurisdiction,
        tags,
        uploadDate: new Date(),
        processingStatus: 'pending',
        fileUrl,
        size: file.size,
        contentType: file.type
      });
      
      setUploadStatus('success');
      
      // Reset form
      setFile(null);
      setTags([]);
      
      // Reset input element
      const fileInput = document.getElementById('document-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setUploadStatus('error', error instanceof Error ? error.message : 'Upload failed');
    }
  }, [file, documentType, jurisdiction, tags, addDocument, setUploadStatus, setUploadProgress]);
  
  const isLoading = uploadStatus === 'loading';
  const isSuccess = uploadStatus === 'success';
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload regulatory documents, contracts, policies, and other compliance-related files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {uploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
          
          {isSuccess && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">
                Document uploaded successfully and is now being processed.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4">
            <div>
              <Label htmlFor="document-file">Select File</Label>
              <Input 
                id="document-file"
                type="file" 
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {file && (
                <p className="text-sm text-gray-500 mt-1">
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select 
                  value={documentType} 
                  onValueChange={(value) => setDocumentType(value as DocumentType)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regulation">Regulation</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="control">Control</SelectItem>
                    <SelectItem value="disclosure">Disclosure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select 
                  value={jurisdiction} 
                  onValueChange={(value) => setJurisdiction(value as Jurisdiction)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="jurisdiction">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="federal">Federal</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input 
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add tags and press Enter"
                  disabled={isLoading}
                />
                <Button 
                  type="button" 
                  onClick={handleAddTag}
                  disabled={isLoading || !tagInput.trim()}
                >
                  Add
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X 
                        size={14} 
                        className="cursor-pointer" 
                        onClick={() => handleRemoveTag(tag)} 
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Upload Progress</Label>
                  <span className="text-sm text-gray-500">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full mt-4"
              disabled={isLoading || !file}
            >
              {isLoading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 