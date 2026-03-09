import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// POST /api/teachers/register - Register a new teacher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    // Check if teacher already exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { email }
    })

    if (existingTeacher) {
      return NextResponse.json({ error: 'Teacher with this email already exists' }, { status: 409 })
    }

    // Create teacher in database (password stored as provided)
    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password
      }
    })

    // Copy default behaviors to the new teacher
    const defaultTeacher = await prisma.teacher.findUnique({
      where: { email: 'default@teacher.com' }
    })

    if (defaultTeacher) {
      const defaultBehaviors = await prisma.behavior.findMany({
        where: { 
          teacherId: defaultTeacher.id,
          isDefault: true
        }
      })

      // Create copies of default behaviors for the new teacher
      for (const defaultBehavior of defaultBehaviors) {
        await prisma.behavior.create({
          data: {
            name: defaultBehavior.name,
            praise: defaultBehavior.praise,
            teacherId: teacher.id,
            isDefault: false, // These are copies, not the original defaults
            behaviorType: defaultBehavior.behaviorType
          }
        })
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { teacherId: teacher.id, email: teacher.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({ 
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        createdAt: teacher.createdAt
      }, 
      token 
    }, { status: 201 })
  } catch (error) {
    console.error('Error registering teacher:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/teachers?id=xxx - Get teacher profile (name, email)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('id')

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, name: true, email: true }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/teachers - Update teacher credentials (name and/or password)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, currentPassword, name, newPassword } = body

    if (!teacherId || !currentPassword) {
      return NextResponse.json({ error: 'Teacher ID and current password are required' }, { status: 400 })
    }

    if (!name && !newPassword) {
      return NextResponse.json({ error: 'Provide at least name or new password to update' }, { status: 400 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    if (currentPassword !== teacher.password) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    const updateData: { name?: string; password?: string } = {}
    if (name && name.trim()) {
      updateData.name = name.trim()
    }
    if (newPassword && newPassword.trim()) {
      updateData.password = newPassword.trim()
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: updateData,
      select: { id: true, name: true, email: true }
    })

    return NextResponse.json(updatedTeacher)
  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/teachers - Login teacher
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find teacher in database
    const teacher = await prisma.teacher.findUnique({
      where: { email }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    if (password !== teacher.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      { teacherId: teacher.id, email: teacher.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        createdAt: teacher.createdAt
      },
      token
    })
  } catch (error) {
    console.error('Error logging in teacher:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/teachers?id=xxx - Delete teacher account and all associated data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('id')

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 })
    }

    // Verify teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    // Prevent deletion of default teacher
    if (teacher.email === 'default@teacher.com') {
      return NextResponse.json({ error: 'Cannot delete default teacher' }, { status: 403 })
    }

    // Delete teacher (cascades to classes, behaviors, groupWorks)
    await prisma.teacher.delete({
      where: { id: teacherId }
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}