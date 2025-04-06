import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth-helpers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const documentId = params.id
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })
    
    if (!document) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Check if user has access to this document
    const isAdminOrManager = user.role === 'admin' || user.role === 'manager'
    const isOwner = document.uploadedById === user.id
    
    if (!isAdminOrManager && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({ success: true, document })
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const documentId = params.id
    const { name, tags, jurisdiction } = await request.json()
    
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })
    
    if (!document) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Check if user can update this document
    const isAdminOrManager = user.role === 'admin' || user.role === 'manager'
    const isOwner = document.uploadedById === user.id
    
    if (!isAdminOrManager && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...(name && { name }),
        ...(tags && { tags }),
        ...(jurisdiction && { jurisdiction })
      }
    })
    
    return NextResponse.json({
      success: true,
      document: updatedDocument
    })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update document' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const documentId = params.id
    
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })
    
    if (!document) {
      return NextResponse.json(
        { success: false, message: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Check if user can delete this document
    const isAdmin = user.role === 'admin'
    const isOwner = document.uploadedById === user.id
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      )
    }
    
    // Delete document
    await prisma.document.delete({
      where: { id: documentId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Document successfully deleted'
    })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete document' },
      { status: 500 }
    )
  }
} 