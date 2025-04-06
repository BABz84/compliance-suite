import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { controlDesignSchema } from '@/lib/validation-schemas'
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
    const result = controlDesignSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      }, { status: 400 })
    }
    
    const { name, policyIds, riskCategory, controlType } = result.data
    
    // Get the policy documents
    const policyDocuments = await prisma.document.findMany({
      where: { 
        id: { in: policyIds },
        type: 'policy'
      }
    })
    
    if (policyDocuments.length !== policyIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more policy documents not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // In a real implementation, this would call an AI service with specific control design instructions
    // For now, we'll just create a placeholder control design
    const controlDesign = {
      name,
      controlType: controlType || 'preventive',
      riskCategory: riskCategory || 'Data Protection',
      description: `This control provides safeguards for ${riskCategory || 'organizational data'} based on requirements in ${policyDocuments.map((doc: any) => doc.name).join(', ')}.`,
      objective: `To ensure the protection of ${riskCategory || 'organizational data'} through ${controlType || 'preventive'} measures.`,
      implementation: [
        {
          step: 'Designate Control Owner',
          description: 'Assign a senior leader responsible for this control'
        },
        {
          step: 'Define Metrics',
          description: 'Establish key metrics to measure control effectiveness'
        },
        {
          step: 'Develop Procedures',
          description: 'Create detailed procedures for control execution'
        },
        {
          step: 'Training',
          description: 'Train all relevant personnel on control procedures'
        },
        {
          step: 'Testing',
          description: 'Conduct regular testing to verify control effectiveness'
        }
      ],
      testingProcedures: [
        `Quarterly review of ${controlType || 'preventive'} measures`,
        'Annual third-party assessment',
        'Ongoing monitoring through automated tools',
        'Regular compliance checks against referenced policies'
      ],
      referencedPolicies: policyDocuments.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        relevantSections: ['Section 3.2', 'Section 4.5']
      }))
    }
    
    // Create a new document for the control design
    const controlDocument = await prisma.document.create({
      data: {
        id: uuidv4(),
        name,
        type: 'control',
        tags: ['Draft', 'AI-Generated', controlType || 'preventive', riskCategory || 'Data Protection'],
        uploadedById: user.id,
        uploadDate: new Date(),
        processingStatus: 'completed',
        fileUrl: `https://storage.example.com/documents/${uuidv4()}`,
        fileSize: Buffer.from(JSON.stringify(controlDesign)).length,
        contentType: 'application/json'
      }
    })
    
    // Create AI interaction record
    const interaction = await prisma.aIInteraction.create({
      data: {
        id: uuidv4(),
        featureType: 'control-design',
        prompt: `Design ${controlType || 'a'} control named "${name}" for ${riskCategory || 'organizational data protection'}`,
        response: JSON.stringify(controlDesign),
        context: {
          controlName: name,
          policyDocuments: policyDocuments.map((doc: any) => ({ id: doc.id, name: doc.name })),
          riskCategory,
          controlType
        },
        userId: user.id,
        documentId: controlDocument.id,
        createdAt: new Date(),
        reviewStatus: 'pending',
        sourceCitations: policyDocuments.map((doc: any) => `${doc.name}`)
      }
    })
    
    return NextResponse.json({
      success: true,
      interaction,
      controlDocument,
      controlDesign
    })
  } catch (error) {
    return handleApiError(error)
  }
} 