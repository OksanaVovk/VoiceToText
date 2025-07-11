import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssemblyAI } from "assemblyai";

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY!;
const ASSEMBLYAI_UPLOAD_URL = "https://api.assemblyai.com/v2/upload";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function uploadToAssemblyAI(audioBuffer: Buffer): Promise<string> {
  const response = await fetch(ASSEMBLYAI_UPLOAD_URL, {
    method: "POST",
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      "content-type": "application/octet-stream",
    },
    body: audioBuffer,
  });

  const data = await response.json();
  return data.upload_url;
}

export async function POST(req: NextRequest) {
  try {
    // --- Step 1: Parse multipart/form-data
    const formData = await req.formData();
    const file = formData.get("audio") as File;
    const clerkUserId = formData.get("clerkUserId") as string;

    if (!file || !clerkUserId) {
      return NextResponse.json(
        { error: "Missing file or clerkUserId" },
        { status: 400 }
      );
    }
    // --- Step 2: Check user access
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: `User with clerkUserId: ${clerkUserId} not found` },
        { status: 400 }
      );
    }

    // Порахувати кількість записів voiceEntries для цього користувача
    const voiceEntryCount = await prisma.voiceEntry.count({
      where: { userId: existingUser.id },
    });

    if (voiceEntryCount >= 2 && existingUser.paymentStatus !== "PAID") {
      return NextResponse.json(
        { error: "You must pay to add more entries" },
        { status: 403 }
      );
    }

    // --- Прочитати файл у Buffer
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // --- Завантажити на AssemblyAI
    const uploadUrl = await uploadToAssemblyAI(audioBuffer);

    // --- Виконати транскрипцію
    const client = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY });
    const transcript = await client.transcripts.transcribe({
      audio: uploadUrl,
      speech_model: "universal",
      language_detection: true,
      auto_chapters: true,
      auto_highlights: true,
    });

    // --- Зберегти в базу
    const newEntry = await prisma.voiceEntry.create({
      data: {
        userId: existingUser.id,
        transcript: transcript.text,
        audioUrl: uploadUrl,
      },
    });

    // Отримати всі записи користувача після додавання нового
    const allEntries = await prisma.voiceEntry.findMany({
      where: { userId: existingUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      newEntry,
      allEntries,
    });
  } catch (error) {
    console.error("Voice upload error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
