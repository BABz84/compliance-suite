import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { summarizationSchema } from '@/lib/validation-schemas'
import { handleApiError } from '@/lib/error-handling'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validate request body
    const result = summarizationSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      }, { status: 400 })
    }
    
    const { documentId, options } = result.data
    
    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })
    
    if (!document) {
      return NextResponse.json(
        { success: false, message: 'Document not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // In a real implementation, this would call an AI service with specific instructions
    // For now, we'll just create a placeholder summary
    const summary = `
This document covers key aspects of ${document.type === 'regulation' ? 'regulatory requirements' : 'business operations'}.

Key points:
1. The document establishes core principles for ${document.type} management
2. It outlines responsibilities for different stakeholders
3. Compliance requirements are detailed in sections 3-7
4. Implementation deadlines are set for Q3 2024
5. Reporting requirements include quarterly assessments

This summary is based on the full document which is ${(document.fileSize / 1024).toFixed(1)}KB in size.
`
    
    // Create AI interaction record
    const interaction = await prisma.aIInteraction.create({
      data: {
        id: uuidv4(),
        featureType: 'summarization',
        prompt: `Summarize document: ${document.name}${options?.maxLength ? ` with max length ${options.maxLength} words` : ''}`,
        response: summary,
        context: {
          documentId: document.id,
          documentName: document.name,
          options
        },
        userId: user.id,
        createdAt: new Date(),
        reviewStatus: 'pending',
        documentId: document.id,
        sourceCitations: [`${document.name} - full document`]
      }
    })
    
    return NextResponse.json({
      success: true,
      interaction,
      summary
    })
  } catch (error) {
    return handleApiError(error)
  }
} 