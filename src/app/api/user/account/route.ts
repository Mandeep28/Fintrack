import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id && !session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    // Find the user to verify role and status
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(userId ? [{ id: userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : []),
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { message: "Admin accounts cannot be deleted from the user settings page." },
        { status: 400 }
      );
    }

    // Verify confirmation payload
    const body = await req.json().catch(() => ({}));
    const confirmationText = body?.confirmationText?.trim()?.toLowerCase();

    if (confirmationText !== "delete my account") {
      return NextResponse.json(
        { message: "Please type 'delete my account' to confirm deletion." },
        { status: 400 }
      );
    }

    // 30-day soft delete
    await prisma.user.update({
      where: { id: user.id },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your account has been moved to Trash. You have 30 days to recover it before permanent removal.",
    });
  } catch (error) {
    console.error("DELETE /api/user/account error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
