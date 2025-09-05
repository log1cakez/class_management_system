import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/behaviors?teacherId=xxx - Get all behaviors for a teacher
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 })
    }

    // Get behaviors for this teacher
    const behaviors = await prisma.behavior.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(behaviors)
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

    if (!name || !teacherId) {
      return NextResponse.json({ error: 'Name and teacherId are required' }, { status: 400 })
    }

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const newBehavior = await prisma.behavior.create({
      data: {
        name,
        teacherId
      }
    })

    return NextResponse.json(newBehavior, { status: 201 })
  } catch (error) {
    console.error('Error creating behavior:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/behaviors?id=xxx - Update a behavior
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { name, teacherId } = body

    if (!id || !teacherId) {
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

// DELETE /api/behaviors?id=xxx - Delete a behavior
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const teacherId = searchParams.get('teacherId')

    if (!id || !teacherId) {
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
