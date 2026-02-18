import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: roomId } = params;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    const membership = await prisma.roomMember.create({
      data: {
        roomId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
