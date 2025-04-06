import { NextResponse } from 'next/server'
import { PrismaClientKnownRequestError, PrismaClientValidationError, PrismaClientRustPanicError } from '@prisma/client/runtime/library'
import { ZodError } from 'zod'

// Custom error response interface
interface ErrorResponse {
  success: false
  message: string
  details?: any
  code?: string
}

// Error handling for Prisma-specific errors
export function handlePrismaError(error: any): { response: NextResponse; logged: boolean } {
  console.error('Database error:', error)
  
  let errorResponse: ErrorResponse = {
    success: false,
    message: 'An unexpected database error occurred'
  }
  
  let status = 500
  let logged = true
  
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle known request errors
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        errorResponse = {
          success: false,
          message: 'This record already exists',
          code: 'DUPLICATE_ENTRY',
          details: error.meta?.target
        }
        status = 409 // Conflict
        break
        
      case 'P2025': // Record not found
        errorResponse = {
          success: false,
          message: 'Record not found',
          code: 'NOT_FOUND'
        }
        status = 404
        break
        
      case 'P2003': // Foreign key constraint failure
        errorResponse = {
          success: false,
          message: 'Related record does not exist',
          code: 'FOREIGN_KEY_FAILURE'
        }
        status = 400
        break
        
      default:
        errorResponse = {
          success: false,
          message: `Database error: ${error.code}`,
          code: error.code
        }
    }
  } else if (error instanceof PrismaClientValidationError) {
    // Handle validation errors
    errorResponse = {
      success: false,
      message: 'Invalid data provided to database operation',
      code: 'VALIDATION_ERROR'
    }
    status = 400
  } else if (error instanceof PrismaClientRustPanicError) {
    // Critical database errors
    errorResponse = {
      success: false,
      message: 'A critical database error occurred',
      code: 'DATABASE_PANIC'
    }
    status = 500
  }
  
  return {
    response: NextResponse.json(errorResponse, { status }),
    logged
  }
}

// Handle validation errors from Zod
export function handleValidationError(error: ZodError): NextResponse {
  const formattedErrors = error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }))
  
  return NextResponse.json({
    success: false,
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: formattedErrors
  }, { status: 400 })
}

// Centralized error handler for API routes
export function handleApiError(error: any): NextResponse {
  if (error instanceof ZodError) {
    return handleValidationError(error)
  }
  
  if (
    error instanceof PrismaClientKnownRequestError ||
    error instanceof PrismaClientValidationError ||
    error instanceof PrismaClientRustPanicError
  ) {
    const { response } = handlePrismaError(error)
    return response
  }
  
  // Default error handler for other types of errors
  console.error('API error:', error)
  
  return NextResponse.json({
    success: false,
    message: error.message || 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR'
  }, { status: 500 })
} 