import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { comparisonSchema } from '@/lib/validation-schemas'
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
    const result = comparisonSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      }, { status: 400 })
    }
    
    const { documentIds, comparisonType = 'both' } = result.data
    
    // Get the documents
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } }
    })
    
    if (documents.length !== documentIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more documents not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // In a real implementation, this would call an AI service with specific comparison instructions
    // For now, we'll just create a placeholder comparison result
    const comparisonResult = {
      documentDetails: documents.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        jurisdiction: doc.jurisdiction
      })),
      similarities: comparisonType !== 'differences' ? [
        {
          aspect: 'Data Security Requirements',
          description: 'Both documents require encryption of sensitive data at rest and in transit.',
          sections: [
            { documentId: documentIds[0], section: 'Section 4.2' },
            { documentId: documentIds[1], section: 'Article 5.3' }
          ]
        },
        {
          aspect: 'Breach Notification',
          description: 'Both documents mandate notification of affected parties after a data breach.',
          sections: [
            { documentId: documentIds[0], section: 'Section 7.1' },
            { documentId: documentIds[1], section: 'Article 9.4' }
          ]
        }
      ] : [],
      differences: comparisonType !== 'similarities' ? [
        {
          aspect: 'Notification Timeline',
          description: 'Documents specify different timelines for breach notification.',
          details: [
            { documentId: documentIds[0], detail: 'Requires notification within 72 hours' },
            { documentId: documentIds[1], detail: 'Requires notification within 30 days' }
          ]
        },
        {
          aspect: 'Data Subject Rights',
          description: 'Documents have different scopes for data subject rights.',
          details: [
            { documentId: documentIds[0], detail: 'Includes right to be forgotten' },
            { documentId: documentIds[1], detail: 'No specific provision for deletion requests' }
          ]
        }
      ] : [],
      summary: `The compared documents share core principles regarding data security and breach notification requirements, but differ significantly in implementation timelines and the scope of individual rights granted to data subjects. Document "${documents[0].name}" has more stringent requirements for breach notification (72 hours vs 30 days) compared to "${documents[1].name}".`
    }
    
    // Create AI interaction record
    const interaction = await prisma.aIInteraction.create({
      data: {
        id: uuidv4(),
        featureType: 'comparison',
        prompt: `Compare documents: ${documents.map((d: any) => d.name).join(' and ')} for ${comparisonType}`,
        response: JSON.stringify(comparisonResult),
        context: {
          documentIds: documentIds,
          documentNames: documents.map((d: any) => d.name),
          comparisonType
        },
        userId: user.id,
        createdAt: new Date(),
        reviewStatus: 'pending',
        sourceCitations: documents.map((d: any) => `${d.name} - full document`)
      }
    })
    
    return NextResponse.json({
      success: true,
      interaction,
      comparisonResult
    })
  } catch (error) {
    return handleApiError(error)
  }
} 