"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import AudioUploader from "./components/AudioUploader";
import { useVoiceEntries } from "./context/VoiceEntriesContext";
import Fox from "./components/Fox";

interface VoiceEntry {
  id: string;
  transcript: string;
  audioUrl?: string | null;
  createdAt: string;
}

export default function Home() {
  const { voiceEntries, setVoiceEntries } = useVoiceEntries();
  const { user } = useUser();

  const syncUser = async () => {
    if (!user) return;

    try {
      const response = await axios.post<{
        user: { voiceEntries: VoiceEntry[] };
      }>("/api/auth/handle", {
        email: user.emailAddresses[0].emailAddress,
        clerkUserId: user.id,
      });

      setVoiceEntries(response.data.user.voiceEntries || []);
    } catch (error) {
      console.error("Sync user failed:", error);
    }
  };

  useEffect(() => {
    syncUser();
  }, [user]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      {user ? (
        <div className="flex h-full p-8 gap-8">
          {/* Sidebar with history */}
          <div className="flex flex-col h-full w-1/3 border-r border-gray-300 pr-8">
            <h2 className="text-2xl font-semibold mb-8">
              Transcription History
            </h2>
            <div className="space-y-4 max-h-[80vh] pr-2 overflow-y-auto">
              {voiceEntries.length > 0 ? (
                voiceEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white p-4 rounded shadow-sm border border-gray-200  space-y-3"
                  >
                    <p className="text-sm text-gray-500">
                      <strong>Date:</strong> {formatDate(entry.createdAt)}
                    </p>
                    {entry.audioUrl && (
                      <audio controls src={entry.audioUrl} className="w-full" />
                    )}
                    <p className="text-sm text-gray-800">
                      <strong>Transcript:</strong> {entry.transcript}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No entries yet.</p>
              )}
            </div>
          </div>

          {/* Main uploader area */}
          <div className="flex w-2/3 justify-center items-start">
            <AudioUploader clerkUserId={user.id} />
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex pt-28 justify-center">
          <div>
            <div className="h-[200px]  w-[300px]">
              <Fox />
            </div>
            <AudioUploader clerkUserId={null} />
          </div>
        </div>
      )}
    </>
  );
}
