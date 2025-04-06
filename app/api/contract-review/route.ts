import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth-helpers'
import { prisma } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { contractId, regulatoryIds } = await request.json()
    
    if (!contractId) {
      return NextResponse.json(
        { success: false, message: 'Contract ID is required' },
        { status: 400 }
      )
    }
    
    // Retrieve the contract document
    const contract = await prisma.document.findUnique({
      where: { id: contractId, type: 'contract' }
    })
    
    if (!contract) {
      return NextResponse.json(
        { success: false, message: 'Contract not found' },
        { status: 404 }
      )
    }
    
    // Get regulatory documents for context if provided
    let regulatoryDocuments: any[] = []
    if (regulatoryIds && regulatoryIds.length > 0) {
      regulatoryDocuments = await prisma.document.findMany({
        where: {
          id: { in: regulatoryIds },
          type: 'regulation'
        }
      })
    }
    
    // In a real implementation, this would call an AI service
    // For now, we'll just create a placeholder response
    const analysisResult = {
      overallRiskScore: 7.2,
      complianceStatus: 'Needs Review',
      complianceIssues: [
        {
          clause: 'Section 4.2',
          issue: 'Data retention policy does not specify duration for personal data storage',
          regulation: 'GDPR Article 5(1)(e)',
          severity: 'High',
          recommendation: 'Specify clear time limits for storage of different data categories'
        },
        {
          clause: 'Section 7.1',
          issue: 'Vague language regarding disclosure to third parties',
          regulation: 'CCPA Section 1798.100',
          severity: 'Medium',
          recommendation: 'Clearly identify categories of third parties and purpose of data sharing'
        },
        {
          clause: 'Section 12',
          issue: 'Breach notification timeline exceeds regulatory requirement',
          regulation: 'GDPR Article 33',
          severity: 'Medium',
          recommendation: 'Reduce notification timeline from 7 days to 72 hours'
        }
      ],
      regulatoryReferences: regulatoryDocuments.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        relevance: 'High'
      }))
    }
    
    // Create AI interaction record
    const interaction = await prisma.aIInteraction.create({
      data: {
        id: uuidv4(),
        featureType: 'contract-review',
        prompt: `Analyze contract ${contract.name} for compliance issues`,
        response: JSON.stringify(analysisResult),
        context: {
          contractId: contract.id,
          contractName: contract.name,
          regulatoryDocuments: regulatoryDocuments.map((doc: any) => ({ id: doc.id, name: doc.name }))
        },
        userId: user.id,
        createdAt: new Date(),
        reviewStatus: 'pending',
        sourceCitations: [
          'GDPR Article 5', 
          'GDPR Article 33', 
          'CCPA Section 1798.100'
        ]
      }
    })
    
    return NextResponse.json({
      success: true,
      interaction,
      analysisResult
    })
  } catch (error) {
    console.error('Error processing contract review:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process contract review' },
      { status: 500 }
    )
  }
} 