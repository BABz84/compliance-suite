import { Storage } from '@google-cloud/storage'
import { v4 as uuidv4 } from 'uuid'
import { GCP_PROJECT_ID, GCP_STORAGE_BUCKET, isDevelopment } from './config'

// Mock storage for development mode
const mockStorage = {
  files: new Map<string, { buffer: Buffer, contentType: string, name: string }>(),
  
  // Mock upload function
  async upload(buffer: Buffer, contentType: string, name?: string): Promise<string> {
    const fileId = uuidv4()
    const fileName = name || `file-${fileId}`
    
    this.files.set(fileId, {
      buffer,
      contentType,
      name: fileName
    })
    
    return `https://storage.example.com/documents/${fileId}/${fileName}`
  },
  
  // Mock download function
  async download(fileUrl: string): Promise<Buffer | null> {
    try {
      const fileId = fileUrl.split('/').slice(-2)[0]
      const file = this.files.get(fileId)
      
      if (!file) {
        console.error(`File not found: ${fileUrl}`)
        return null
      }
      
      return file.buffer
    } catch (error) {
      console.error('Error downloading mock file:', error)
      return null
    }
  },
  
  // Mock delete function
  async delete(fileUrl: string): Promise<boolean> {
    try {
      const fileId = fileUrl.split('/').slice(-2)[0]
      return this.files.delete(fileId)
    } catch (error) {
      console.error('Error deleting mock file:', error)
      return false
    }
  }
}

// Initialize real storage if not in development mode
let storage: Storage | null = null
if (!isDevelopment && GCP_PROJECT_ID) {
  storage = new Storage({
    projectId: GCP_PROJECT_ID
  })
}

// Upload a file
export async function uploadFile(
  buffer: Buffer,
  contentType: string,
  fileName: string
): Promise<string> {
  // Use mock storage for development mode
  if (isDevelopment || !storage) {
    return mockStorage.upload(buffer, contentType, fileName)
  }
  
  try {
    // Get a reference to the bucket
    const bucket = storage.bucket(GCP_STORAGE_BUCKET)
    
    // Generate a unique file name
    const fileId = uuidv4()
    const fileExt = fileName.split('.').pop() || ''
    const destinationFileName = `${fileId}/${fileName}`
    
    // Upload the file
    const file = bucket.file(destinationFileName)
    await file.save(buffer, {
      contentType,
      metadata: {
        contentType,
        originalName: fileName
      }
    })
    
    // Make the file publicly accessible (for demo purposes)
    // In production, you might want to use signed URLs or other access control
    await file.makePublic()
    
    // Return the public URL
    return `https://storage.googleapis.com/${GCP_STORAGE_BUCKET}/${destinationFileName}`
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error(`Failed to upload file: ${(error as Error).message}`)
  }
}

// Download a file
export async function downloadFile(fileUrl: string): Promise<Buffer | null> {
  // Use mock storage for development mode
  if (isDevelopment || !storage) {
    return mockStorage.download(fileUrl)
  }
  
  try {
    // Extract the file path from the URL
    const filePath = fileUrl.replace(`https://storage.googleapis.com/${GCP_STORAGE_BUCKET}/`, '')
    
    // Get a reference to the file
    const bucket = storage.bucket(GCP_STORAGE_BUCKET)
    const file = bucket.file(filePath)
    
    // Download the file
    const [fileContent] = await file.download()
    return fileContent
  } catch (error) {
    console.error('Error downloading file:', error)
    return null
  }
}

// Delete a file
export async function deleteFile(fileUrl: string): Promise<boolean> {
  // Use mock storage for development mode
  if (isDevelopment || !storage) {
    return mockStorage.delete(fileUrl)
  }
  
  try {
    // Extract the file path from the URL
    const filePath = fileUrl.replace(`https://storage.googleapis.com/${GCP_STORAGE_BUCKET}/`, '')
    
    // Get a reference to the file
    const bucket = storage.bucket(GCP_STORAGE_BUCKET)
    const file = bucket.file(filePath)
    
    // Delete the file
    await file.delete()
    return true
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
} 