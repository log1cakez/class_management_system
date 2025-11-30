import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRandomBadgeForBehaviorType } from '@/assets/images/badges'

// POST /api/group-work-awards - Award points, praise, and badge to a group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, behaviorId, points, praise, teacherId } = body

    console.log('Awarding group work with data:', { groupId, behaviorId, points, praise, teacherId })

    if (!groupId || !points || !teacherId) {
      return NextResponse.json({ error: 'Group ID, points, and teacher ID are required' }, { status: 400 })
    }

    // Verify group exists and get behavior info, including students
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        groupWork: {
          include: {
            behaviors: {
              include: {
                behavior: true
              }
            }
          }
        },
        students: {
          include: {
            student: true
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Get behavior info and predefined praise if behaviorId is provided
    let behavior = null
    let predefinedPraise = null
    
    if (behaviorId) {
      behavior = await prisma.behavior.findUnique({
        where: { id: behaviorId }
      })
      console.log('Found behavior:', behavior)
      
      // Find the predefined praise for this behavior in this group work
      const groupWorkBehavior = group.groupWork.behaviors.find(
        (gb: any) => gb.behaviorId === behaviorId
      )
      console.log('Group work behaviors:', group.groupWork.behaviors.map((gb: any) => ({
        behaviorId: gb.behaviorId,
        behaviorName: gb.behavior.name,
        praise: gb.praise
      })))
      console.log('Found group work behavior:', groupWorkBehavior)
      predefinedPraise = groupWorkBehavior?.praise
      console.log('Predefined praise:', predefinedPraise)
    }

    // Use predefined praise if available, otherwise use the provided praise or a default
    const finalPraise = predefinedPraise || praise || "Great work!"
    
    console.log('Final praise to use:', finalPraise)

    // Get a random badge for the behavior type
    const behaviorType = behavior?.behaviorType || 'GROUP_WORK'
    console.log('Using behavior type:', behaviorType)
    
    const randomBadge = getRandomBadgeForBehaviorType(behaviorType as 'INDIVIDUAL' | 'GROUP_WORK')
    console.log('Selected badge:', randomBadge)

    console.log('Creating award with data:', {
      groupId,
      behaviorId: behaviorId || null,
      points,
      praise: finalPraise,
      badgeId: randomBadge.id,
      badgeName: randomBadge.name,
      awardedBy: teacherId
    })

    // Create the award record
    const award = await prisma.groupWorkAward.create({
      data: {
        groupId,
        behaviorId: behaviorId || null,
        points,
        praise: finalPraise,
        badgeId: randomBadge.id,
        badgeName: randomBadge.name,
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

    console.log('Group work award created successfully:', award.id)

    // Add points to each student in the group
    if (group.students && group.students.length > 0) {
      const behaviorName = behavior?.name || 'Group work'
      const reason = `Group work: ${group.groupWork.name} - ${finalPraise}`
      
      // Update each student's points and create point records
      const studentUpdatePromises = group.students.map(async (groupStudent) => {
        const studentId = groupStudent.studentId
        
        // Update student's total points
        await prisma.student.update({
          where: { id: studentId },
          data: {
            points: {
              increment: points
            }
          }
        })
        
        // Create point record for tracking
        await prisma.point.create({
          data: {
            studentId,
            behaviorId: behaviorId || null,
            points,
            reason,
            behaviorName
          }
        })
      })
      
      try {
        await Promise.all(studentUpdatePromises)
        console.log(`Successfully added ${points} points to ${group.students.length} students in group ${group.name}`)
      } catch (studentError) {
        console.error('Error updating student points (non-critical):', studentError)
        // Don't fail the entire request if student point updates fail
        // The group award was already created successfully
      }
    }

    // Return the award with badge information
    return NextResponse.json({
      ...award,
      badge: randomBadge,
      praise: award.praise
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating group work award:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      groupId,
      behaviorId,
      points,
      praise,
      teacherId
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/group-work-awards?groupId=xxx - Get awards for a specific group
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    const awards = await prisma.groupWorkAward.findMany({
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

    return NextResponse.json(awards)

  } catch (error) {
    console.error('Error fetching group work awards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
