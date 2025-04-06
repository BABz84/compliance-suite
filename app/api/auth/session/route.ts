import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getUserByEmail } from '@/lib/db-helpers'
import { handleApiError } from '@/lib/error-handling'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', code: 'MISSING_AUTH_TOKEN' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    
    try {
      const decoded = verify(
        token, 
        process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production'
      ) as any
      
      const user = await getUserByEmail(decoded.email)
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found', code: 'USER_NOT_FOUND' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lastLoginAt: user.lastLoginAt
        }
      })
    } catch (jwtError) {
      // Handle JWT specific errors
      console.error('JWT verification error:', jwtError)
      return NextResponse.json(
        { success: false, message: 'Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      )
    }
  } catch (error) {
    // Use the centralized error handler for other errors
    return handleApiError(error)
  }
} 