import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/behaviors?teacherId=xxx - Get all behaviors for a teacher (including default behaviors)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 })
    }

    // Get teacher's custom behaviors
    const customBehaviors = await prisma.behavior.findMany({
      where: { 
        teacherId,
        isDefault: false
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get default behaviors (from default teacher)
    const defaultTeacher = await prisma.teacher.findUnique({
      where: { email: 'default@teacher.com' }
    })

    let defaultBehaviors = []
    if (defaultTeacher) {
      defaultBehaviors = await prisma.behavior.findMany({
        where: { 
          teacherId: defaultTeacher.id,
          isDefault: true
        },
        orderBy: { createdAt: 'asc' }
      })
    }

    // Combine default and custom behaviors (defaults first)
    const allBehaviors = [...defaultBehaviors, ...customBehaviors]

    return NextResponse.json(allBehaviors)
  } catch (error) {
    console.error('Error fetching behaviors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/behaviors - Create a new behavior
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, teacherId } = body

    console.log('Creating behavior with data:', { name, teacherId })

    if (!name || !teacherId) {
      console.log('Missing required fields:', { name: !!name, teacherId: !!teacherId })
      return NextResponse.json({ error: 'Name and teacherId are required' }, { status: 400 })
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
        teacherId
      }
    })

    console.log('Behavior created successfully:', newBehavior.id)
    return NextResponse.json(newBehavior, { status: 201 })
  } catch (error) {
    console.error('Error creating behavior:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name,
      teacherId
    })
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
    console.error('Error updating behavior:', error)
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

    // Allow deletion of all behaviors (including default ones)

    // Delete the behavior
    await prisma.behavior.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Behavior deleted successfully' })
  } catch (error) {
    console.error('Error deleting behavior:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
