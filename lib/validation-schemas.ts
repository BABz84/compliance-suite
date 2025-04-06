import { z } from 'zod'

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

// Document schemas
export const createDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  type: z.enum(['regulation', 'contract', 'policy', 'control', 'disclosure'], {
    errorMap: () => ({ message: 'Invalid document type' })
  }),
  jurisdiction: z.string().optional(),
  tags: z.array(z.string()).optional(),
  fileSize: z.number().int().positive().optional(),
  contentType: z.string().optional()
})

export const updateDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').optional(),
  tags: z.array(z.string()).optional(),
  jurisdiction: z.string().optional()
})

export const processDocumentSchema = z.object({
  documentId: z.string().uuid('Invalid document ID format')
})

// AI Interaction schemas
export const regulatoryQaSchema = z.object({
  query: z.string().min(1, 'Query is required'),
  documentIds: z.array(z.string().uuid('Invalid document ID format')).optional()
})

export const contractReviewSchema = z.object({
  contractId: z.string().uuid('Invalid contract ID format'),
  regulatoryIds: z.array(z.string().uuid('Invalid regulatory document ID format')).optional()
})

export const summarizationSchema = z.object({
  documentId: z.string().uuid('Invalid document ID format'),
  options: z.object({
    maxLength: z.number().int().positive().optional(),
    focus: z.array(z.string()).optional()
  }).optional()
})

export const comparisonSchema = z.object({
  documentIds: z.array(z.string().uuid('Invalid document ID format')).min(2, 'At least two documents required'),
  comparisonType: z.enum(['differences', 'similarities', 'both'], {
    errorMap: () => ({ message: 'Invalid comparison type' })
  }).optional()
})

export const policyDraftingSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  regulatoryIds: z.array(z.string().uuid('Invalid regulatory document ID format')),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  contentRequirements: z.string().optional()
})

export const controlDesignSchema = z.object({
  name: z.string().min(1, 'Control name is required'),
  policyIds: z.array(z.string().uuid('Invalid policy document ID format')),
  riskCategory: z.string().optional(),
  controlType: z.enum(['preventive', 'detective', 'corrective', 'directive'], {
    errorMap: () => ({ message: 'Invalid control type' })
  }).optional()
})

export const alignmentGapSchema = z.object({
  frameworkIds: z.array(z.string().uuid('Invalid framework document ID format')),
  companyDocumentIds: z.array(z.string().uuid('Invalid company document ID format')),
  analysisType: z.enum(['compliance', 'maturity', 'risk'], {
    errorMap: () => ({ message: 'Invalid analysis type' })
  }).optional()
})

// Feedback schema
export const feedbackSchema = z.object({
  interactionId: z.string().uuid('Invalid interaction ID format'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  content: z.string().optional(),
  feedbackType: z.enum(['general', 'document', 'interaction'], {
    errorMap: () => ({ message: 'Invalid feedback type' })
  }).default('interaction')
}) 