import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test a simple query
    const teacherCount = await prisma.teacher.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      teacherCount 
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL is missing'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
