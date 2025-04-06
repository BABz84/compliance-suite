import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
import { getUserByEmail } from './db-helpers'

export async function getUserFromRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    
    const token = authHeader.split(' ')[1]
    
    const decoded = verify(
      token, 
      process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production'
    ) as any
    
    const user = await getUserByEmail(decoded.email)
    
    return user
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
} 