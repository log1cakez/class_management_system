"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { IMAGES } from "@/assets/images/config";

const STORAGE_KEY = "app_background";

export type BackgroundType = "default" | "custom";

interface BackgroundState {
  type: BackgroundType;
  url: string | null;
}

interface BackgroundContextValue {
  backgroundType: BackgroundType;
  backgroundUrl: string;
  isVideo: boolean;
  setCustomBackground: (dataUrl: string) => void;
  resetToDefault: () => void;
}

const defaultVideoUrl = IMAGES.HOMEPAGE_BG;

function loadFromStorage(): BackgroundState {
  if (typeof window === "undefined") {
    return { type: "default", url: null };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as BackgroundState;
      if (parsed.type === "custom" && parsed.url) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { type: "default", url: null };
}

function saveToStorage(state: BackgroundState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

const BackgroundContext = createContext<BackgroundContextValue | null>(null);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BackgroundState>(() => loadFromStorage());

  useEffect(() => {
    setState(loadFromStorage());
  }, []);

  const setCustomBackground = useCallback((dataUrl: string) => {
    const newState: BackgroundState = { type: "custom", url: dataUrl };
    setState(newState);
    saveToStorage(newState);
  }, []);

  const resetToDefault = useCallback(() => {
    const newState: BackgroundState = { type: "default", url: null };
    setState(newState);
    saveToStorage(newState);
  }, []);

  const value: BackgroundContextValue = {
    backgroundType: state.type,
    backgroundUrl: state.type === "custom" && state.url ? state.url : defaultVideoUrl,
    isVideo: state.type === "default",
    setCustomBackground,
    resetToDefault,
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const ctx = useContext(BackgroundContext);
  if (!ctx) {
    return {
      backgroundType: "default" as BackgroundType,
      backgroundUrl: defaultVideoUrl,
      isVideo: true,
      setCustomBackground: () => {},
      resetToDefault: () => {},
    };
  }
  return ctx;
}
