import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth-helpers'
import { v4 as uuidv4 } from 'uuid'
import { createDocumentSchema } from '@/lib/validation-schemas'
import { handleApiError } from '@/lib/error-handling'

// GET documents with optional filters
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'
    
    // Get documents based on user role
    // Admin and Manager can see all documents, others only see their own
    const isAdminOrManager = user.role === 'admin' || user.role === 'manager'
    const userId = isAdminOrManager ? undefined : user.id
    
    const documents = await prisma.document.findMany({
      where: {
        ...(userId ? { uploadedById: userId } : {}),
        ...(type !== 'all' ? { type } : {})
      },
      orderBy: { uploadDate: 'desc' },
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
    
    return NextResponse.json({ success: true, documents })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST new document
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    // In a real implementation, this would handle file upload to cloud storage
    // For now, we'll mock the file upload process
    const body = await request.json()
    
    // Validate input
    const result = createDocumentSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: result.error.errors
      }, { status: 400 })
    }
    
    const { name, type, jurisdiction, tags, fileSize, contentType } = result.data
    
    // Create document in database
    const document = await prisma.document.create({
      data: {
        id: uuidv4(),
        name,
        type,
        jurisdiction: jurisdiction || null,
        tags: tags || [],
        uploadedById: user.id,
        uploadDate: new Date(),
        processingStatus: 'pending',
        fileUrl: `https://storage.example.com/documents/${uuidv4()}`,
        fileSize: fileSize || 0,
        contentType: contentType || 'application/pdf'
      }
    })
    
    return NextResponse.json({
      success: true,
      document
    })
  } catch (error) {
    return handleApiError(error)
  }
} 