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
    
    const { query, documentIds } = await request.json()
    
    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query is required' },
        { status: 400 }
      )
    }
    
    // Create context with regulation documents if provided
    let context: any = {}
    if (documentIds && documentIds.length > 0) {
      const documents = await prisma.document.findMany({
        where: {
          id: { in: documentIds },
          type: 'regulation'
        }
      })
      
      context.documentReferences = documents.map((doc: any) => ({
        id: doc.id,
        name: doc.name
      }))
    }
    
    // In a real implementation, this would call an AI service
    // For now, we'll just create a placeholder response
    const response = `Based on the regulatory framework, the requirement you're asking about falls under Article 17 of GDPR ("Right to erasure" or "Right to be forgotten").

Key points to consider:
1. Organizations must erase personal data "without undue delay" when requested by the data subject.
2. These circumstances include when the data is no longer necessary or when consent is withdrawn.
3. There are exceptions where the right to erasure doesn't apply, such as for compliance with legal obligations.

For financial institutions specifically, you need to balance this right with other regulatory requirements like record-keeping obligations.`
    
    // Create AI interaction record
    const interaction = await prisma.aIInteraction.create({
      data: {
        id: uuidv4(),
        featureType: 'regulatory-qa',
        prompt: query,
        response,
        context,
        userId: user.id,
        createdAt: new Date(),
        reviewStatus: 'pending',
        sourceCitations: ['GDPR Article 17', 'Financial Record Keeping Regulation 45-106']
      }
    })
    
    return NextResponse.json({
      success: true,
      interaction
    })
  } catch (error) {
    console.error('Error processing regulatory Q&A:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process regulatory Q&A' },
      { status: 500 }
    )
  }
} 