import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/behaviors?teacherId=xxx&type=GROUP_WORK - Get behaviors for a teacher, optionally filtered by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const behaviorType = searchParams.get('type') // 'INDIVIDUAL' or 'GROUP_WORK'

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 })
    }

    // Build where clause
    const whereClause: any = { 
      teacherId
    }

    // Add behavior type filter if specified
    if (behaviorType && (behaviorType === 'INDIVIDUAL' || behaviorType === 'GROUP_WORK')) {
      whereClause.behaviorType = behaviorType
    }

    // Get behaviors for this teacher (including copied defaults and custom behaviors)
    const behaviors = await prisma.behavior.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' } // Order by creation date - copied defaults will be first since they're created during registration
    })

    return NextResponse.json(behaviors)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/behaviors - Create a new behavior
export async function POST(request: NextRequest) {
  let name: string | undefined
  let teacherId: string | undefined
  let behaviorType: string | undefined
  
  try {
    const body = await request.json()
    const parsed = body
    name = parsed.name
    teacherId = parsed.teacherId
    behaviorType = parsed.behaviorType || 'INDIVIDUAL' // Default to INDIVIDUAL

    console.log('Creating behavior with data:', { name, teacherId, behaviorType })

    if (!name || !teacherId) {
      console.log('Missing required fields:', { name: !!name, teacherId: !!teacherId })
      return NextResponse.json({ error: 'Name and teacherId are required' }, { status: 400 })
    }

    // Validate behavior type
    if (behaviorType !== 'INDIVIDUAL' && behaviorType !== 'GROUP_WORK') {
      return NextResponse.json({ error: 'Invalid behavior type. Must be INDIVIDUAL or GROUP_WORK' }, { status: 400 })
    }

    // Verify teacher exists
    console.log('Checking if teacher exists:', teacherId)
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      console.log('Teacher not found:', teacherId)
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    console.log('Teacher found, creating behavior:', teacher.name)

    const newBehavior = await prisma.behavior.create({
      data: {
        name,
        teacherId,
        behaviorType: (behaviorType || 'INDIVIDUAL') as 'INDIVIDUAL' | 'GROUP_WORK'
      }
    })

    return NextResponse.json(newBehavior, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/behaviors - Update a behavior
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, teacherId } = body

    console.log('Updating behavior with data:', { id, name, teacherId })

    if (!id || !teacherId) {
      console.log('Missing required fields for update:', { id: !!id, teacherId: !!teacherId })
      return NextResponse.json({ error: 'Behavior ID and teacherId are required' }, { status: 400 })
    }

    // First verify the behavior exists and belongs to this teacher
    const existingBehavior = await prisma.behavior.findFirst({
      where: { 
        id,
        teacherId // Ensure teacher owns this behavior
      }
    })

    if (!existingBehavior) {
      return NextResponse.json({ error: 'Behavior not found or access denied' }, { status: 404 })
    }

    const updatedBehavior = await prisma.behavior.update({
      where: { id },
      data: {
        name: name || existingBehavior.name,
      }
    })

    return NextResponse.json(updatedBehavior)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/behaviors - Delete a behavior
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, teacherId } = body

    console.log('Deleting behavior with data:', { id, teacherId })

    if (!id || !teacherId) {
      console.log('Missing required fields for delete:', { id: !!id, teacherId: !!teacherId })
      return NextResponse.json({ error: 'Behavior ID and teacherId are required' }, { status: 400 })
    }

    // First verify the behavior exists
    const existingBehavior = await prisma.behavior.findUnique({
      where: { id }
    })

    if (!existingBehavior) {
      return NextResponse.json({ error: 'Behavior not found' }, { status: 404 })
    }

    // Prevent deletion of default behaviors by regular teachers
    if (existingBehavior.isDefault) {
      return NextResponse.json({ error: 'Cannot delete default behaviors' }, { status: 403 })
    }

    // For custom behaviors, ensure the teacher owns them
    if (existingBehavior.teacherId !== teacherId) {
      return NextResponse.json({ error: 'Access denied - you can only delete your own custom behaviors' }, { status: 403 })
    }

    // Delete the behavior
    await prisma.behavior.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Behavior deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
