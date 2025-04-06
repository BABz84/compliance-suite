import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { alignmentGapSchema } from '@/lib/validation-schemas'
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
    const result = alignmentGapSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      }, { status: 400 })
    }
    
    const { frameworkIds, companyDocumentIds, analysisType = 'compliance' } = result.data
    
    // Get the framework documents
    const frameworkDocuments = await prisma.document.findMany({
      where: { 
        id: { in: frameworkIds },
        type: 'regulation'
      }
    })
    
    if (frameworkDocuments.length !== frameworkIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more framework documents not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // Get the company documents
    const companyDocuments = await prisma.document.findMany({
      where: { 
        id: { in: companyDocumentIds },
        type: { in: ['policy', 'control'] }
      }
    })
    
    if (companyDocuments.length !== companyDocumentIds.length) {
      return NextResponse.json(
        { success: false, message: 'One or more company documents not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // In a real implementation, this would call an AI service with specific alignment analysis
    // For now, we'll just create a placeholder analysis
    const analysis = {
      analysisType,
      overallScore: analysisType === 'compliance' ? 78 : (analysisType === 'maturity' ? 3.2 : 'Medium'),
      frameworks: frameworkDocuments.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        jurisdiction: doc.jurisdiction
      })),
      companyDocuments: companyDocuments.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type
      })),
      alignmentAreas: [
        {
          category: 'Data Security',
          alignmentScore: analysisType === 'compliance' ? 85 : (analysisType === 'maturity' ? 3.8 : 'Low'),
          details: 'Strong alignment in data security policies and controls',
          matchedItems: [
            { frameworkId: frameworkIds[0], requirement: 'Data Encryption', 
              companyDocId: companyDocumentIds[0], implementation: 'Encryption Policy' },
            { frameworkId: frameworkIds[0], requirement: 'Access Controls', 
              companyDocId: companyDocumentIds[1], implementation: 'Role-based Access Control' }
          ]
        },
        {
          category: 'Data Subject Rights',
          alignmentScore: analysisType === 'compliance' ? 60 : (analysisType === 'maturity' ? 2.5 : 'Medium'),
          details: 'Partial alignment with data subject rights requirements',
          matchedItems: [
            { frameworkId: frameworkIds[0], requirement: 'Right to Access', 
              companyDocId: companyDocumentIds[0], implementation: 'Data Subject Access Request Process' }
          ]
        }
      ],
      gapAreas: [
        {
          category: 'Breach Notification',
          priority: 'High',
          details: 'Gap in breach notification timeline requirements',
          requirements: [
            { frameworkId: frameworkIds[0], requirement: '72-hour Notification Timeline', 
              recommendation: 'Update incident response policy to include 72-hour notification requirement' }
          ]
        },
        {
          category: 'Data Transfer',
          priority: 'Medium',
          details: 'International data transfer safeguards not adequately addressed',
          requirements: [
            { frameworkId: frameworkIds[0], requirement: 'Cross-border Data Transfer Safeguards', 
              recommendation: 'Develop policy specific to international data transfers' }
          ]
        }
      ],
      recommendations: [
        'Update incident response policy to include 72-hour breach notification timeline',
        'Develop international data transfer policy',
        'Enhance data subject rights implementation, especially for deletion requests',
        'Consider third-party risk assessment program'
      ]
    }
    
    // Create AI interaction record
    const interaction = await prisma.aIInteraction.create({
      data: {
        id: uuidv4(),
        featureType: 'alignment-gap',
        prompt: `Perform ${analysisType} analysis between ${frameworkDocuments.map((doc: any) => doc.name).join(', ')} and company documents`,
        response: JSON.stringify(analysis),
        context: {
          frameworkDocuments: frameworkDocuments.map((doc: any) => ({ id: doc.id, name: doc.name })),
          companyDocuments: companyDocuments.map((doc: any) => ({ id: doc.id, name: doc.name, type: doc.type })),
          analysisType
        },
        userId: user.id,
        createdAt: new Date(),
        reviewStatus: 'pending',
        sourceCitations: [
          ...frameworkDocuments.map((doc: any) => `${doc.name}`),
          ...companyDocuments.map((doc: any) => `${doc.name}`)
        ]
      }
    })
    
    return NextResponse.json({
      success: true,
      interaction,
      analysis
    })
  } catch (error) {
    return handleApiError(error)
  }
} 