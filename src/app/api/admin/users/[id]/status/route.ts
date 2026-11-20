import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const actionSchema = z.object({
  action: z.enum(["activate", "deactivate", "soft_delete", "restore", "hard_delete"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = actionSchema.parse(body);

    // Prevent modifying yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { message: "You cannot change your own administrator account status." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, status: true, deletedAt: true },
    });

    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Protect other admins from being modified
    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { message: "Administrator accounts cannot be modified through user management." },
        { status: 400 }
      );
    }

    let updatedUser;

    switch (action) {
      case "activate": {
        updatedUser = await prisma.user.update({
          where: { id },
          data: {
            status: "ACTIVE",
            deletedAt: null,
          },
          select: { id: true, name: true, email: true, status: true },
        });
        return NextResponse.json({
          success: true,
          message: `User ${targetUser.email} has been activated.`,
          user: updatedUser,
        });
      }

      case "deactivate": {
        updatedUser = await prisma.user.update({
          where: { id },
          data: {
            status: "DEACTIVATED",
          },
          select: { id: true, name: true, email: true, status: true },
        });
        return NextResponse.json({
          success: true,
          message: `User ${targetUser.email} has been deactivated.`,
          user: updatedUser,
        });
      }

      case "soft_delete": {
        // Enforce rule: only deactivated users can be soft-deleted
        if (targetUser.status !== "DEACTIVATED") {
          return NextResponse.json(
            { message: "Only deactivated accounts can be moved to Trash. Please deactivate the user first." },
            { status: 400 }
          );
        }

        updatedUser = await prisma.user.update({
          where: { id },
          data: {
            status: "DELETED",
            deletedAt: new Date(),
          },
          select: { id: true, name: true, email: true, status: true, deletedAt: true },
        });
        return NextResponse.json({
          success: true,
          message: `User ${targetUser.email} moved to Trash (Recovery available for 30 days).`,
          user: updatedUser,
        });
      }

      case "restore": {
        updatedUser = await prisma.user.update({
          where: { id },
          data: {
            status: "ACTIVE",
            deletedAt: null,
          },
          select: { id: true, name: true, email: true, status: true },
        });
        return NextResponse.json({
          success: true,
          message: `User ${targetUser.email} has been restored to Active status.`,
          user: updatedUser,
        });
      }

      case "hard_delete": {
        await prisma.user.delete({
          where: { id },
        });
        return NextResponse.json({
          success: true,
          message: `User ${targetUser.email} has been permanently deleted.`,
        });
      }

      default:
        return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
    }
    console.error("PATCH /api/admin/users/[id]/status error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
