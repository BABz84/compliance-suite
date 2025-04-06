import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getUserByEmail } from '@/lib/db-helpers'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const token = authHeader.split(' ')[1]
    
    const decoded = verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production'
    ) as any
    
    const user = await getUserByEmail(decoded.email)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
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
  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Invalid session' },
      { status: 401 }
    )
  }
} 