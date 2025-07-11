import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import axios from "axios";
import { useVoiceEntries } from "../context/VoiceEntriesContext";
import { useRouter } from "next/navigation";

interface AudioUploaderProps {
  clerkUserId: string | null;
}

interface VoiceUploadResponse {
  newEntry: VoiceEntry;
  allEntries: VoiceEntry[];
}

interface VoiceEntry {
  id: string;
  transcript: string;
  audioUrl?: string | null;
  createdAt: string;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ clerkUserId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { setVoiceEntries } = useVoiceEntries();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (error === "You must pay to add more entries") {
      router.push("/payment");
    }
  }, [error]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setTranscript("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Будь ласка, виберіть аудіофайл");
      return;
    }

    if (clerkUserId === null) {
      setError("Зареєструйтеся будь ласка");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("clerkUserId", clerkUserId);

    try {
      setLoading(true);
      setError("");

      const response = await axios.post<VoiceUploadResponse>(
        "/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setTranscript(response.data.newEntry.transcript);
      setVoiceEntries(response.data.allEntries);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Помилка при завантаженні");
      } else {
        setError("Невідома помилка");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClean = () => {
    const selectedFile = null;
    setFile(selectedFile);
    setTranscript("");
    setError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col">
      {/* Заголовок зверху по центру */}
      <h2 className="text-2xl font-semibold text-center mb-8">
        🎤 Завантаж аудіо для транскрипції
      </h2>

      <div className="flex items-center justify-center gap-4 ">
        <input
          type="file"
          accept=".mp3,.wav,.m4a"
          onChange={handleFileChange}
          disabled={loading}
          ref={inputRef}
          className="flex-grow border border-gray-300 rounded px-2 py-1"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="min-w-[120px] bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-400"
        >
          {loading ? "Завантаження..." : "Розпізнати"}
        </button>
      </div>

      {/* Транскрипт або помилка з відступом зверху */}
      {(error || transcript) && (
        <div className="mt-10 text-center">
          {error && error !== "You must pay to add more entries" && (
            <p className="text-red-600 mb-6">❌ {error}</p>
          )}
          {transcript && (
            <>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">📝 Результат:</h3>
                <p>{transcript}</p>
              </div>
              <button
                onClick={handleClean}
                className="min-w-[120px] bg-blue-600 text-white py-2 px-4 rounded"
              >
                Очистити
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
