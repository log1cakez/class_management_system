import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/group-points?groupId=xxx - Get all points for a group
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    const groupPoints = await prisma.groupWorkAward.findMany({
      where: { groupId },
      include: {
        behavior: true,
        group: {
          include: {
            groupWork: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(groupPoints)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/group-points - Award points to a group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, behaviorId, points, reason, behaviorName, teacherId } = body


    if (!groupId || !points || !reason || !teacherId) {
      return NextResponse.json({ error: 'Group ID, points, reason, and teacher ID are required' }, { status: 400 })
    }

    // Verify group exists
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        groupWork: true
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Create group point record
    const groupPoint = await prisma.groupWorkAward.create({
      data: {
        groupId,
        behaviorId: behaviorId || null,
        points,
        praise: reason,
        awardedBy: teacherId
      },
      include: {
        behavior: true,
        group: {
          include: {
            groupWork: true
          }
        }
      }
    })

    return NextResponse.json(groupPoint, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/group-points - Update group points
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, points, reason, behaviorName } = body


    if (!id) {
      return NextResponse.json({ error: 'Point ID is required' }, { status: 400 })
    }

    // Verify the point exists
    const existingPoint = await prisma.groupWorkAward.findUnique({
      where: { id }
    })

    if (!existingPoint) {
      return NextResponse.json({ error: 'Group point not found' }, { status: 404 })
    }

    // Update the point
    const updatedPoint = await prisma.groupWorkAward.update({
      where: { id },
      data: {
        points: points !== undefined ? points : existingPoint.points,
        praise: reason || existingPoint.praise
      },
      include: {
        behavior: true,
        group: {
          include: {
            groupWork: true
          }
        }
      }
    })

    return NextResponse.json(updatedPoint)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/group-points - Delete group points
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body


    if (!id) {
      return NextResponse.json({ error: 'Point ID is required' }, { status: 400 })
    }

    // Verify the point exists
    const existingPoint = await prisma.groupWorkAward.findUnique({
      where: { id }
    })

    if (!existingPoint) {
      return NextResponse.json({ error: 'Group point not found' }, { status: 404 })
    }

    // Delete the point
    await prisma.groupWorkAward.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Group point deleted successfully' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
