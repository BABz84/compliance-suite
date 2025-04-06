// lib/config.ts
// Configuration for the application with environment variable management

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/compliance_suite'

// Authentication configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production'
export const JWT_EXPIRY = '8h'

// AI API configuration for Claude (Anthropic)
export const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY
export const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages'
export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-opus-20240229'

// Google Cloud configuration
export const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID
export const GCP_STORAGE_BUCKET = process.env.GCP_STORAGE_BUCKET || 'compliance-suite-documents'
export const GCP_USE_SECRET_MANAGER = process.env.GCP_USE_SECRET_MANAGER === 'true'
export const GCP_SECRET_NAME = process.env.GCP_SECRET_NAME

// Application configuration
export const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '10485760', 10) // 10MB by default
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/json'
]

// Determine if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development'

// Function to validate required configuration
export function validateConfig() {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET']
  
  if (process.env.NODE_ENV === 'production') {
    requiredVars.push('CLAUDE_API_KEY')
    
    if (GCP_USE_SECRET_MANAGER) {
      requiredVars.push('GCP_PROJECT_ID', 'GCP_SECRET_NAME')
    }
  }
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`)
    console.error('Please set these variables in your .env file or environment.')
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required configuration for production environment')
    }
  }
  
  return missingVars.length === 0
} 