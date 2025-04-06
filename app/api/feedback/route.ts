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
    
    const { interactionId, rating, comment, improvementSuggestions } = await request.json()
    
    if (!interactionId) {
      return NextResponse.json(
        { success: false, message: 'Interaction ID is required' },
        { status: 400 }
      )
    }
    
    if (rating === undefined || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }
    
    // Verify the interaction exists
    const interaction = await prisma.aIInteraction.findUnique({
      where: { id: interactionId }
    })
    
    if (!interaction) {
      return NextResponse.json(
        { success: false, message: 'Interaction not found' },
        { status: 404 }
      )
    }
    
    // Create feedback record
    const feedback = await prisma.feedback.create({
      data: {
        id: uuidv4(),
        interactionId,
        userId: user.id,
        rating,
        comment: comment || '',
        improvementSuggestions: improvementSuggestions || '',
        createdAt: new Date()
      }
    })
    
    // Update the interaction review status
    await prisma.aIInteraction.update({
      where: { id: interactionId },
      data: { 
        reviewStatus: 'reviewed',
        reviewedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      feedback
    })
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user is admin or manager
    if (user.role !== 'admin' && user.role !== 'manager') {
      return NextResponse.json(
        { success: false, message: 'Permission denied' },
        { status: 403 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const interactionId = searchParams.get('interactionId')
    const featureType = searchParams.get('featureType')
    
    // Build the query
    const where: any = {}
    
    if (interactionId) {
      where.interactionId = interactionId
    }
    
    if (featureType) {
      where.interaction = {
        featureType
      }
    }
    
    // Get feedback with interactions and user info
    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        interaction: {
          select: {
            id: true,
            featureType: true,
            prompt: true,
            createdAt: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      feedback
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
} 