"use client";

import { useEffect, useState } from "react";
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
  const [showDrawer, setShowDrawer] = useState(false);
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
        <div className="flex flex-col sm:flex-row h-full p-4 gap-4 relative">
          {/* Sidebar як drawer для мобілки */}
          <div
            className={`fixed top-0 left-0 w-3/4 max-w-[300px] bg-white z-40 h-[100vh] border-r border-gray-300 shadow-none transform transition-transform duration-300 ease-in-out ${
              showDrawer ? "translate-x-0" : "-translate-x-full"
            } sm:relative sm:translate-x-0 sm:flex sm:flex-col sm:w-1/3 border-r border-gray-300 p-4`}
          >
            <div className="flex justify-between items-center mb-4 sm:mb-8">
              <h2 className="text-xl font-semibold">Transcription History</h2>
              <button
                onClick={() => setShowDrawer(false)}
                className="sm:hidden text-gray-600 text-2xl hover:text-blue-600 transition-colors duration-200"
                aria-label="Close drawer"
              >
                ×
              </button>
            </div>
            <div className="space-y-4 max-h-[80vh] pr-2 overflow-y-auto">
              {voiceEntries.length > 0 ? (
                voiceEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white p-4 rounded shadow-sm border border-gray-200 space-y-3"
                  >
                    <p className="text-sm text-gray-500">
                      <strong>Date:</strong>{" "}
                      {new Date(entry.createdAt).toLocaleDateString()}
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
          <div className="min-h-screen flex flex-col pt-28  w-full sm:w-2/3">
            <AudioUploader clerkUserId={user.id} />
            <a
              onClick={() => setShowDrawer(true)}
              className="sm:hidden text-blue-600 hover:text-blue-800 cursor-pointer select-none inline-flex items-center mt-4"
            >
              History
              <span className="ml-1 text-sm font-semibold">-&gt;</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex pt-28 pb-28 flex-col items-center">
          <div className="h-[200px] w-[300px] mb-4">
            <Fox />
          </div>
          <AudioUploader clerkUserId={null} />
        </div>
      )}
    </>
  );
}
