import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/group-works/[id] - Update a group work
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, behaviorIds, groups, teacherId, behaviorPraises } = body;
    const { id } = params;

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    // Verify the group work belongs to the teacher
    const existingGroupWork = await prisma.groupWork.findFirst({
      where: {
        id: id,
        teacherId: teacherId,
      },
    });

    if (!existingGroupWork) {
      return NextResponse.json(
        { error: "Group work not found or access denied" },
        { status: 404 }
      );
    }

    // Update the group work with transaction
    const updatedGroupWork = await prisma.$transaction(async (tx) => {
      // Update the group work name
      const groupWork = await tx.groupWork.update({
        where: { id },
        data: { name },
      });

      // Delete existing groups and their students
      await tx.groupStudent.deleteMany({
        where: {
          group: {
            groupWorkId: id,
          },
        },
      });
      await tx.group.deleteMany({
        where: {
          groupWorkId: id,
        },
      });

      // Delete existing behaviors
      await tx.groupWorkBehavior.deleteMany({
        where: {
          groupWorkId: id,
        },
      });

      // Create new groups
      if (groups && groups.length > 0) {
        for (const group of groups) {
          const newGroup = await tx.group.create({
            data: {
              name: group.name,
              groupWorkId: id,
            },
          });

          // Add students to the group
          if (group.studentIds && group.studentIds.length > 0) {
            await tx.groupStudent.createMany({
              data: group.studentIds.map((studentId: string) => ({
                groupId: newGroup.id,
                studentId,
              })),
            });
          }
        }
      }

      // Create new behaviors
      if (behaviorIds && behaviorIds.length > 0) {
        await tx.groupWorkBehavior.createMany({
          data: behaviorIds.map((behaviorId: string) => ({
            groupWorkId: id,
            behaviorId,
            praise: behaviorPraises?.[behaviorId] || null,
          })),
        });
      }

      // Return the updated group work with all relations
      return await tx.groupWork.findUnique({
        where: { id },
        include: {
          class: true,
          groups: {
            include: {
              students: {
                include: {
                  student: true,
                },
              },
            },
          },
          behaviors: {
            include: {
              behavior: true,
            },
          },
        },
      });
    });

    return NextResponse.json(updatedGroupWork);
  } catch (error) {
    console.error("Error updating group work:", error);
    return NextResponse.json(
      { error: "Failed to update group work" },
      { status: 500 }
    );
  }
}

// DELETE /api/group-works/[id] - Delete a specific group work
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    // Verify the group work belongs to the teacher
    const groupWork = await prisma.groupWork.findFirst({
      where: {
        id: id,
        teacherId: teacherId,
      },
    });

    if (!groupWork) {
      return NextResponse.json(
        { error: "Group work not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the group work (cascade will handle related records)
    await prisma.groupWork.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting group work:", error);
    return NextResponse.json(
      { error: "Failed to delete group work" },
      { status: 500 }
    );
  }
}
