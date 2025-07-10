"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import AudioUploader from "./components/AudioUploader";
import { useVoiceEntries } from "./context/VoiceEntriesContext";

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

  return (
    <>
      {user ? (
        <div className="flex min-h-screen p-8 gap-8">
          <div className="flex flex-col w-1/3 border-r border-gray-300 pr-8">
            <h2 className="text-2xl font-semibold mb-4">Список записів</h2>
            <ul className="list-disc list-inside space-y-2">
              {voiceEntries.length > 0 ? (
                voiceEntries.map((ent) => (
                  <li key={ent.id}>
                    <p>Дата: {ent.createdAt}</p>
                    <p>Url: {ent.audioUrl}</p>
                    <p>Результат: {ent.transcript}</p>
                  </li>
                ))
              ) : (
                <p>Поки немає записів</p>
              )}
            </ul>
          </div>
          <div className="flex w-2/3  justify-center">
            <AudioUploader clerkUserId={user ? user.id : null} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen ">
          <AudioUploader clerkUserId={user ? user.id : null} />
        </div>
      )}
    </>
  );
}
