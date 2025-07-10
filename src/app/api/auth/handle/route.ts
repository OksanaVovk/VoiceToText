import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, clerkUserId } = await req.json();

    if (!email || !clerkUserId) {
      return NextResponse.json(
        { error: "Missing email or clerkId" },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        voiceEntries: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      await prisma.user.create({
        data: { email, clerkUserId },
      });

      user = await prisma.user.findUnique({
        where: { clerkUserId },
        include: {
          voiceEntries: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Sync user error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
