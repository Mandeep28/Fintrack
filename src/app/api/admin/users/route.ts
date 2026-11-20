import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Automated 30-day hard-delete cleanup:
    // Permanently purge any soft-deleted accounts whose 30-day recovery window has passed
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    try {
      await prisma.user.deleteMany({
        where: {
          status: "DELETED",
          deletedAt: {
            lte: thirtyDaysAgo,
          },
        },
      });
    } catch (cleanupErr) {
      console.error("Auto-purge cleanup error:", cleanupErr);
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") || "ALL";
    const searchQuery = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(5, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    // Platform-wide counts for stats
    const [totalUsers, activeUsers, deactivatedUsers, inTrashUsers] = await Promise.all([
      prisma.user.count({ where: { status: { not: "DELETED" } } }),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "DEACTIVATED" } }),
      prisma.user.count({ where: { status: "DELETED" } }),
    ]);

    // Build filter condition
    const where: Prisma.UserWhereInput = {};

    if (statusParam === "ACTIVE") {
      where.status = "ACTIVE";
    } else if (statusParam === "DEACTIVATED") {
      where.status = "DEACTIVATED";
    } else if (statusParam === "DELETED") {
      where.status = "DELETED";
    } else {
      // "ALL" view defaults to active and deactivated users (excluding trash)
      where.status = { not: "DELETED" };
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const [users, filteredCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        // STRICT PRIVACY: Project metadata only. ZERO financial data (no expenses, budgets, goals, rooms).
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          provider: true,
          isVerified: true,
          image: true,
          phoneNumber: true,
          createdAt: true,
          deletedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(filteredCount / limit);

    return NextResponse.json({
      users,
      total: filteredCount,
      page,
      totalPages,
      metrics: {
        totalUsers,
        activeUsers,
        deactivatedUsers,
        inTrashUsers,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
