import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/classes?teacherId=xxx - Get all classes for a teacher
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 })
    }

    // Only fetch classes that belong to this teacher
    const teacherClasses = await prisma.class.findMany({
      where: { teacherId },
      include: {
        students: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(teacherClasses)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/classes - Create a new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, teacherId } = body

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

    const newClass = await prisma.class.create({
      data: {
        name,
        description: description || null,
        teacherId
      },
      include: {
        students: true
      }
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/classes?id=xxx - Update a class
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()
    const { name, description, teacherId } = body

    if (!id || !teacherId) {
      return NextResponse.json({ error: 'Class ID and teacherId are required' }, { status: 400 })
    }

    // First verify the class exists and belongs to this teacher
    const existingClass = await prisma.class.findFirst({
      where: { 
        id,
        teacherId // Ensure teacher owns this class
      }
    })

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name: name || existingClass.name,
        description: description !== undefined ? description : existingClass.description,
      },
      include: {
        students: true
      }
    })

    return NextResponse.json(updatedClass)
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/classes?id=xxx - Delete a class
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const teacherId = searchParams.get('teacherId')

    if (!id || !teacherId) {
      return NextResponse.json({ error: 'Class ID and teacherId are required' }, { status: 400 })
    }

    // First verify the class exists and belongs to this teacher
    const existingClass = await prisma.class.findFirst({
      where: { 
        id,
        teacherId // Ensure teacher owns this class
      }
    })

    if (!existingClass) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    // Delete the class (students will be deleted due to cascade)
    await prisma.class.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Class deleted successfully' })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}