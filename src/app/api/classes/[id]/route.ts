import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/classes/[id] - Delete a specific class
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
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
