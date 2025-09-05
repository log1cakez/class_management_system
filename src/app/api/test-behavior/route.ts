import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Test a simple query
    const behaviorCount = await prisma.behavior.count()
    const teacherCount = await prisma.teacher.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      behaviorCount,
      teacherCount,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Missing'
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Missing'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, teacherId } = body

    console.log('Test behavior creation with:', { name, teacherId })

    // Test teacher lookup
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      return NextResponse.json({ 
        success: false, 
        error: 'Teacher not found',
        teacherId 
      }, { status: 404 })
    }

    // Test behavior creation
    const newBehavior = await prisma.behavior.create({
      data: {
        name,
        teacherId
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Behavior created successfully',
      behavior: newBehavior 
    })
  } catch (error) {
    console.error('Test behavior creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
