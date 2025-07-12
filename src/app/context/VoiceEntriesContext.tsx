"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface VoiceEntry {
  id: string;
  transcript: string;
  audioUrl?: string | null;
  createdAt: string;
}

interface VoiceEntriesContextType {
  voiceEntries: VoiceEntry[];
  setVoiceEntries: React.Dispatch<React.SetStateAction<VoiceEntry[]>>;
}

const VoiceEntriesContext = createContext<VoiceEntriesContextType | undefined>(
  undefined
);

export const VoiceEntriesProvider = ({ children }: { children: ReactNode }) => {
  const [voiceEntries, setVoiceEntries] = useState<VoiceEntry[]>([]);

  return (
    <VoiceEntriesContext.Provider value={{ voiceEntries, setVoiceEntries }}>
      {children}
    </VoiceEntriesContext.Provider>
  );
};

export const useVoiceEntries = () => {
  const context = useContext(VoiceEntriesContext);
  if (!context) {
    throw new Error(
      "useVoiceEntries must be used within a VoiceEntriesProvider"
    );
  }
  return context;
};
