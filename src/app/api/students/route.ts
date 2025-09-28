import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/students?classId=xxx&teacherId=xxx - Get all students for a class (with teacher authorization)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const teacherId = searchParams.get('teacherId')

    if (!classId || !teacherId) {
      return NextResponse.json({ error: 'Class ID and teacherId are required' }, { status: 400 })
    }

    // First verify the class belongs to this teacher
    const classExists = await prisma.class.findFirst({
      where: { 
        id: classId,
        teacherId // Ensure teacher owns this class
      }
    })

    if (!classExists) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    // Get students for this class
    const classStudents = await prisma.student.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(classStudents)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, classId, points = 0, teacherId } = body

    if (!name || !classId || !teacherId) {
      return NextResponse.json({ error: 'Name, classId, and teacherId are required' }, { status: 400 })
    }

    // First verify the class belongs to this teacher
    const classExists = await prisma.class.findFirst({
      where: { 
        id: classId,
        teacherId // Ensure teacher owns this class
      }
    })

    if (!classExists) {
      return NextResponse.json({ error: 'Class not found or access denied' }, { status: 404 })
    }

    const student = await prisma.student.create({
      data: {
        name,
        classId,
        points
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/students - Update student points
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentIds, pointsToAdd, reason, behavior, teacherId } = body

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Student IDs array is required' }, { status: 400 })
    }

    if (!pointsToAdd || pointsToAdd <= 0) {
      return NextResponse.json({ error: 'Points to add must be greater than 0' }, { status: 400 })
    }

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 })
    }

    // First verify all students belong to classes owned by this teacher
    const students = await prisma.student.findMany({
      where: { 
        id: { in: studentIds }
      },
      include: {
        class: true
      }
    })

    // Check if all students belong to this teacher's classes
    const unauthorizedStudents = students.filter(student => student.class.teacherId !== teacherId)
    if (unauthorizedStudents.length > 0) {
      return NextResponse.json({ error: 'Access denied to some students' }, { status: 403 })
    }

    // Update student points
    const updatePromises = studentIds.map(studentId => 
      prisma.student.update({
        where: { id: studentId },
        data: {
          points: {
            increment: pointsToAdd
          }
        }
      })
    )

    const updatedStudents = await Promise.all(updatePromises)

    // Create point records for tracking (non-blocking)
    try {
      const pointRecordPromises = studentIds.map(studentId =>
        prisma.point.create({
          data: {
            studentId,
            points: pointsToAdd,
            reason: reason || 'Points added',
            behaviorName: behavior || null
          }
        })
      )

      await Promise.all(pointRecordPromises)
    } catch (pointError) {
      // Don't fail the entire request if point records fail
    }

    // Ensure we always return a proper response
    try {
      return NextResponse.json(updatedStudents)
    } catch (responseError) {
      // Return a simplified response if serialization fails
      return NextResponse.json({ 
        success: true, 
        message: 'Points updated successfully',
        studentCount: updatedStudents.length 
      })
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/students?id=xxx&teacherId=xxx - Delete a student
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const teacherId = searchParams.get('teacherId')

    if (!id || !teacherId) {
      return NextResponse.json({ error: 'Student ID and teacherId are required' }, { status: 400 })
    }

    // First verify the student belongs to a class owned by this teacher
    const student = await prisma.student.findFirst({
      where: { id },
      include: {
        class: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.class.teacherId !== teacherId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.student.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}