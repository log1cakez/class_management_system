import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordEmail } from "@/lib/email";

// POST /api/teachers/forgot-password - Send password to registered email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const teacher = await prisma.teacher.findFirst({
      where: {
        email: { equals: email.trim(), mode: "insensitive" },
      },
    });

    if (!teacher) {
      // Don't reveal whether email exists - same response for security
      return NextResponse.json({
        message: "If an account exists with this email, the password has been sent.",
      });
    }

    // Prevent sending default teacher password
    if (teacher.email === "default@teacher.com") {
      return NextResponse.json(
        { error: "Cannot recover password for default account" },
        { status: 403 }
      );
    }

    await sendPasswordEmail(teacher.email, teacher.password, teacher.name);

    return NextResponse.json({
      message: "If an account exists with this email, the password has been sent.",
    });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send email. Check SMTP configuration.",
      },
      { status: 500 }
    );
  }
}
