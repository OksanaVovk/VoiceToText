import { NextRequest, NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { prisma } from "@/lib/prisma";
import { AssemblyAI } from "assemblyai";

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY!;
const ASSEMBLYAI_UPLOAD_URL = "https://api.assemblyai.com/v2/upload";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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

async function uploadToS3(buffer: Buffer, fileName: string): Promise<string> {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `uploads/${fileName}`,
      Body: buffer,
      ContentType: "audio/mpeg",
    },
  });

  await upload.done();

  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${fileName}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as File;
    const clerkUserId = formData.get("clerkUserId") as string;

    if (!file || !clerkUserId) {
      return NextResponse.json(
        { error: "Missing file or clerkUserId" },
        { status: 400 }
      );
    }

    // Check if user exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: `User with clerkUserId: ${clerkUserId} not found` },
        { status: 400 }
      );
    }

    // Limit on the number of records
    const voiceEntryCount = await prisma.voiceEntry.count({
      where: { userId: existingUser.id },
    });

    if (voiceEntryCount >= 2 && existingUser.paymentStatus !== "PAID") {
      return NextResponse.json(
        { error: "You must pay to add more entries" },
        { status: 403 }
      );
    }

    // Read the file into a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const s3Url = await uploadToS3(audioBuffer, fileName);

    // Upload from S3 to AssemblyAI for transcription
    const transcriptResult = await uploadToAssemblyAI(audioBuffer);

    // Initialize AssemblyAI client and start transcription
    const client = new AssemblyAI({ apiKey: ASSEMBLYAI_API_KEY });
    const transcript = await client.transcripts.transcribe({
      audio: transcriptResult,
      speech_model: "universal",
      language_detection: true,
      auto_chapters: true,
      auto_highlights: true,
    });

    // Save transcription result to database
    const newEntry = await prisma.voiceEntry.create({
      data: {
        userId: existingUser.id,
        transcript: transcript.text,
        audioUrl: s3Url,
      },
    });

    // Get all voice entries for a user from the database
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
