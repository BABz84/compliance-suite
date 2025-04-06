import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { policyDraftingSchema } from '@/lib/validation-schemas'
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
    const result = policyDraftingSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      }, { status: 400 })
    }
    
    const { name, regulatoryIds, industry, companySize, contentRequirements } = result.data
    
    // Get the regulatory documents
    const regulatoryDocuments = await prisma.document.findMany({
      where: { 
        id: { in: regulatoryIds },
        type: 'regulation'
      }
    })
    
    if (regulatoryDocuments.length !== regulatoryIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more regulatory documents not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // In a real implementation, this would call an AI service with specific policy drafting instructions
    // For now, we'll just create a placeholder policy draft
    const policyDraft = `# ${name}

## Policy Purpose
This policy establishes guidelines for compliance with ${regulatoryDocuments.map((doc: any) => doc.name).join(', ')}${industry ? ` in the ${industry} industry` : ''}${companySize ? ` for ${companySize} organizations` : ''}.

## Scope
This policy applies to all employees, contractors, and third-party vendors who have access to company systems and data.

## Regulatory Background
${regulatoryDocuments.map((doc: any) => `### ${doc.name}\n${doc.jurisdiction ? `Jurisdiction: ${doc.jurisdiction}\n` : ''}This regulation covers key requirements for data protection and privacy.`).join('\n\n')}

## Policy Requirements

### Data Collection and Processing
1. All data collection must have a lawful basis
2. Data minimization principles must be applied
3. Purpose limitation must be clearly defined

### Data Security
1. All sensitive data must be encrypted at rest and in transit
2. Access controls must implement least privilege principles
3. Regular security assessments must be conducted

### Individual Rights
1. Procedures must be established for data access requests
2. Individuals have the right to correct inaccurate data
3. Data deletion requests must be honored within 30 days

## Implementation Guidelines
1. Department heads are responsible for policy implementation
2. Annual training is required for all staff
3. Compliance audits will be conducted quarterly

${contentRequirements ? `## Additional Requirements\n${contentRequirements}` : ''}

## Effective Date
This policy is effective immediately upon approval.

## Review Cycle
This policy will be reviewed annually or upon significant regulatory changes.`
    
    // Create a new document for the policy draft
    const policyDocument = await prisma.document.create({
      data: {
        id: uuidv4(),
        name,
        type: 'policy',
        tags: ['Draft', 'AI-Generated', ...regulatoryDocuments.map((doc: any) => doc.name)],
        uploadedById: user.id,
        uploadDate: new Date(),
        processingStatus: 'completed',
        fileUrl: `https://storage.example.com/documents/${uuidv4()}`,
        fileSize: Buffer.from(policyDraft).length,
        contentType: 'text/markdown'
      }
    })
    
    // Create AI interaction record
    const interaction = await prisma.aIInteraction.create({
      data: {
        id: uuidv4(),
        featureType: 'policy-drafting',
        prompt: `Draft ${name} policy based on regulatory requirements${industry ? ` for ${industry} industry` : ''}`,
        response: policyDraft,
        context: {
          policyName: name,
          regulatoryDocuments: regulatoryDocuments.map((doc: any) => ({ id: doc.id, name: doc.name })),
          industry,
          companySize,
          contentRequirements
        },
        userId: user.id,
        documentId: policyDocument.id,
        createdAt: new Date(),
        reviewStatus: 'pending',
        sourceCitations: regulatoryDocuments.map((doc: any) => `${doc.name}`)
      }
    })
    
    return NextResponse.json({
      success: true,
      interaction,
      policyDocument,
      policyDraft
    })
  } catch (error) {
    return handleApiError(error)
  }
} 