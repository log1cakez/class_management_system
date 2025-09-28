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

    const groupPoints = await prisma.groupPoint.findMany({
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
  } catch (error) {
    console.error('Error fetching group points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/group-points - Award points to a group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, behaviorId, points, reason, behaviorName } = body

    console.log('Awarding group points with data:', { groupId, behaviorId, points, reason, behaviorName })

    if (!groupId || !points || !reason) {
      return NextResponse.json({ error: 'Group ID, points, and reason are required' }, { status: 400 })
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
    const groupPoint = await prisma.groupPoint.create({
      data: {
        groupId,
        behaviorId: behaviorId || null,
        points,
        reason,
        behaviorName: behaviorName || null
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

    console.log('Group points awarded successfully:', groupPoint.id)
    return NextResponse.json(groupPoint, { status: 201 })
  } catch (error) {
    console.error('Error awarding group points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/group-points - Update group points
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, points, reason, behaviorName } = body

    console.log('Updating group points with data:', { id, points, reason, behaviorName })

    if (!id) {
      return NextResponse.json({ error: 'Point ID is required' }, { status: 400 })
    }

    // Verify the point exists
    const existingPoint = await prisma.groupPoint.findUnique({
      where: { id }
    })

    if (!existingPoint) {
      return NextResponse.json({ error: 'Group point not found' }, { status: 404 })
    }

    // Update the point
    const updatedPoint = await prisma.groupPoint.update({
      where: { id },
      data: {
        points: points !== undefined ? points : existingPoint.points,
        reason: reason || existingPoint.reason,
        behaviorName: behaviorName !== undefined ? behaviorName : existingPoint.behaviorName
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
  } catch (error) {
    console.error('Error updating group points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/group-points - Delete group points
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    console.log('Deleting group points with data:', { id })

    if (!id) {
      return NextResponse.json({ error: 'Point ID is required' }, { status: 400 })
    }

    // Verify the point exists
    const existingPoint = await prisma.groupPoint.findUnique({
      where: { id }
    })

    if (!existingPoint) {
      return NextResponse.json({ error: 'Group point not found' }, { status: 404 })
    }

    // Delete the point
    await prisma.groupPoint.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Group point deleted successfully' })
  } catch (error) {
    console.error('Error deleting group points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
