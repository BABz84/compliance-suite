import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { getUserByEmail, updateUserLastLogin } from '@/lib/db-helpers'
import { loginSchema } from '@/lib/validation-schemas'
import { handleApiError } from '@/lib/error-handling'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const result = loginSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: result.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { email, password } = result.data
    
    const user = await getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    const passwordMatch = await compare(password, user.passwordHash)
    
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Update last login time
    await updateUserLastLogin(user.id)
    
    // Create JWT token
    const token = sign(
      { 
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production',
      { expiresIn: '8h' }
    )
    
    // Return user data and token
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLoginAt: user.lastLoginAt
      },
      token
    })
  } catch (error) {
    // Use the centralized error handler
    return handleApiError(error)
  }
} 