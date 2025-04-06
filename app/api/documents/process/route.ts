import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { documentId } = await request.json()
    
    if (!documentId) {
      return NextResponse.json(
        { success: false, message: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })
    
    if (!document) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Update processing status
    await prisma.document.update({
      where: { id: documentId },
      data: { processingStatus: 'processing' }
    })
    
    // In a real implementation, this would trigger an asynchronous process
    // For example, send a message to a queue for background processing
    
    // For now, we'll just simulate a successful processing
    setTimeout(async () => {
      await prisma.document.update({
        where: { id: documentId },
        data: { processingStatus: 'completed' }
      })
    }, 5000)
    
    return NextResponse.json({
      success: true,
      message: 'Document processing started'
    })
  } catch (error) {
    console.error('Error processing document:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process document' },
      { status: 500 }
    )
  }
} 