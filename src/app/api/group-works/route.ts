import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/group-works - Get all group works for a teacher
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    const groupWorks = await prisma.groupWork.findMany({
      where: {
        teacherId: teacherId,
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(groupWorks);
  } catch (error) {
    console.error("Error fetching group works:", error);
    return NextResponse.json(
      { error: "Failed to fetch group works" },
      { status: 500 }
    );
  }
}

// POST /api/group-works - Create a new group work
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, classId, behaviorIds, groups, teacherId } = body;

    console.log("Received data:", { name, classId, behaviorIds, groups, teacherId });
    console.log("Field validation:", {
      hasName: !!name,
      hasClassId: !!classId,
      hasBehaviorIds: !!behaviorIds,
      hasGroups: !!groups,
      hasTeacherId: !!teacherId
    });

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    if (!name || !classId || !behaviorIds || !groups) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the class belongs to the teacher
    console.log("Checking if class exists:", { classId, teacherId });
    const classExists = await prisma.class.findFirst({
      where: {
        id: classId,
        teacherId: teacherId,
      },
    });

    console.log("Class exists:", !!classExists);
    if (!classExists) {
      return NextResponse.json(
        { error: "Class not found or access denied" },
        { status: 404 }
      );
    }

    // Create the group work with all related data
    console.log("Creating group work with data:", {
      name,
      classId,
      teacherId,
      groupsCount: groups.length,
      behaviorsCount: behaviorIds.length,
      behaviorIds,
      groups: groups.map(g => ({ name: g.name, studentIds: g.studentIds }))
    });

    const groupWork = await prisma.groupWork.create({
      data: {
        name,
        classId,
        teacherId,
        groups: {
          create: groups.map((group: any) => ({
            name: group.name,
            students: {
              create: group.studentIds.map((studentId: string) => ({
                studentId,
              })),
            },
          })),
        },
        behaviors: {
          create: behaviorIds.map((behaviorId: string) => ({
            behaviorId,
          })),
        },
      },
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

    console.log("Group work created successfully:", groupWork.id);

    return NextResponse.json(groupWork);
  } catch (error) {
    console.error("Error creating group work:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to create group work";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/group-works - Delete a group work
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing group work ID" }, { status: 400 });
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