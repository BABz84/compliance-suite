import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { getUserByEmail, updateUserLastLogin } from '@/lib/db-helpers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }
    
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
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    )
  }
} 