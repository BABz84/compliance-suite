import { prisma } from './db'

// User related functions
export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email }
    })
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

export async function updateUserLastLogin(userId: string) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    })
  } catch (error) {
    console.error('Error updating user last login:', error)
    return null
  }
}

// Document related functions
export async function getDocuments(userId?: string, type?: string) {
  try {
    const where: any = {}
    
    if (userId) {
      where.uploadedById = userId
    }
    
    if (type && type !== 'all') {
      where.type = type
    }
    
    return await prisma.document.findMany({
      where,
      orderBy: { uploadDate: 'desc' },
      include: { uploadedBy: true }
    })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return []
  }
}

export async function getDocumentById(id: string) {
  try {
    return await prisma.document.findUnique({
      where: { id },
      include: { uploadedBy: true }
    })
  } catch (error) {
    console.error('Error fetching document by id:', error)
    return null
  }
}

// AI Interaction related functions
export async function getInteractions(
  userId?: string, 
  featureType?: string, 
  reviewStatus?: string
) {
  try {
    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    
    if (featureType && featureType !== 'all') {
      where.featureType = featureType
    }
    
    if (reviewStatus && reviewStatus !== 'all') {
      where.reviewStatus = reviewStatus
    }
    
    return await prisma.aIInteraction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: true, document: true, reviewer: true }
    })
  } catch (error) {
    console.error('Error fetching AI interactions:', error)
    return []
  }
} 