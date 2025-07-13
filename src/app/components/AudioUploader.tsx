import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import axios from "axios";
import { useVoiceEntries } from "../context/VoiceEntriesContext";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

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
  const MAX_FILE_SIZE_MB = 4;

  useEffect(() => {
    if (error === "You must pay to add more entries") {
      router.push("/payment");
    }
  }, [error]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB`);
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setTranscript("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an audio file");
      return;
    }

    if (clerkUserId === null) {
      router.push("/sign-in");
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
        setError(err.response?.data?.error || "Upload failed");
      } else {
        setError("Unknown error");
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
    <div className="max-w-xl mx-auto flex flex-col">
      <h2 className="text-2xl font-semibold text-center mb-8">
        🎤 Upload audio for transcription
      </h2>

      <div className="flex items-center justify-center gap-4 ">
        <label
          htmlFor="file-upload"
          className="flex-grow border border-gray-300 rounded px-2 py-1 cursor-pointer text-gray-600"
        >
          {file ? file.name : "Select audio file"}
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".mp3,.wav,.m4a"
          onChange={handleFileChange}
          disabled={loading}
          ref={inputRef}
          className="hidden"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="min-w-[120px] bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-medium disabled:bg-gray-400"
        >
          {loading ? "Uploading..." : "Transcribe"}
        </button>
      </div>
      {loading && (
        <div className="h-[300px] w-full">
          <DotLottieReact
            src="https://lottie.host/4066f7e0-db46-4513-9f71-84a9ab38021d/Z14SU642Ux.lottie"
            loop
            autoplay
          />
        </div>
      )}
      {(error || transcript) && (
        <div className="mt-10 text-center">
          {error && error !== "You must pay to add more entries" && (
            <p className="text-red-600 mb-6">
              ❌ {typeof error === "string" ? error : JSON.stringify(error)}
            </p>
          )}
          {transcript && (
            <>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">📝 Result:</h3>
                <p>{transcript}</p>
              </div>
              <button
                onClick={handleClean}
                className="min-w-[120px] bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition font-medium"
              >
                Clear
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
