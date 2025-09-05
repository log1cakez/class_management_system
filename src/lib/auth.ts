import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthenticatedUser {
  teacherId: string
  email: string
}

export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser | null {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthenticatedUser
    
    return decoded
  } catch (error) {
    return null
  }
}

export function requireAuth(request: NextRequest): AuthenticatedUser {
  const user = getAuthenticatedUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}
