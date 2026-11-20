import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const forceAll = body?.forceAll === true;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const whereClause: {
      status: string;
      deletedAt?: { lte: Date };
    } = {
      status: "DELETED",
    };

    if (!forceAll) {
      whereClause.deletedAt = { lte: thirtyDaysAgo };
    }

    const { count } = await prisma.user.deleteMany({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      purgedCount: count,
      message: forceAll
        ? `Successfully purged ${count} trash accounts.`
        : `Successfully purged ${count} expired accounts older than 30 days.`,
    });
  } catch (error) {
    console.error("POST /api/admin/trash/purge error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
