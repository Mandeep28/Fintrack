import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;

    // Verify keyword belongs to this user and is a USER custom keyword
    const existing = await prisma.categoryKeyword.findFirst({
      where: {
        id,
        userId,
        source: "USER",
      },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Keyword not found or you do not have permission to delete it" },
        { status: 404 }
      );
    }

    await prisma.categoryKeyword.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Keyword removed" });
  } catch (error) {
    console.error("DELETE /api/categories/keywords/[id] error:", error);
    return NextResponse.json({ message: "Failed to delete keyword" }, { status: 500 });
  }
}
