import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth-helpers'
import { updateDocumentSchema } from '@/lib/validation-schemas'
import { handleApiError } from '@/lib/error-handling'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' },
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
        { success: false, message: 'Document not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // Check if user has access to this document
    const isAdminOrManager = user.role === 'admin' || user.role === 'manager'
    const isOwner = document.uploadedById === user.id
    
    if (!isAdminOrManager && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Access denied', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
    
    return NextResponse.json({ success: true, document })
  } catch (error) {
    return handleApiError(error)
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
        { success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const documentId = params.id
    const body = await request.json()
    
    // Validate input
    const result = updateDocumentSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      }, { status: 400 })
    }
    
    const { name, tags, jurisdiction } = result.data
    
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })
    
    if (!document) {
      return NextResponse.json(
        { success: false, message: 'Document not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // Check if user can update this document
    const isAdminOrManager = user.role === 'admin' || user.role === 'manager'
    const isOwner = document.uploadedById === user.id
    
    if (!isAdminOrManager && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Access denied', code: 'FORBIDDEN' },
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
    return handleApiError(error)
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
        { success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const documentId = params.id
    
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })
    
    if (!document) {
      return NextResponse.json(
        { success: false, message: 'Document not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // Check if user can delete this document
    const isAdmin = user.role === 'admin'
    const isOwner = document.uploadedById === user.id
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Access denied', code: 'FORBIDDEN' },
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
    return handleApiError(error)
  }
} 