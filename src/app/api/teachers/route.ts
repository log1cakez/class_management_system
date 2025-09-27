import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create teacher in database
    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password: hashedPassword
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
            teacherId: teacher.id,
            isDefault: false // These are copies, not the original defaults
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
    const isValidPassword = await bcrypt.compare(password, teacher.password)

    if (!isValidPassword) {
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