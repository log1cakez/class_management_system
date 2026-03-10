"use client";

import { useRef, useState } from "react";
import { useBackground } from "@/contexts/BackgroundContext";

const MAX_SIZE_MB = 3;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT_TYPES = "image/jpeg,image/png,image/gif,image/webp";

interface BackgroundChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BackgroundChangeModal({
  isOpen,
  onClose,
}: BackgroundChangeModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setCustomBackground, resetToDefault, backgroundType } = useBackground();
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      setError(`Image must be under ${MAX_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      return;
    }

    const reader = new FileReader();
    setUploading(true);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        setCustomBackground(dataUrl);
        setUploading(false);
        onClose();
      }
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleReset = () => {
    setError("");
    resetToDefault();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-yellow-400"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-yellow-700 mb-4">
          Change Background
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload an image to use as your custom background. Supported: JPG, PNG, GIF, WebP (max {MAX_SIZE_MB}MB).
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_TYPES}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full px-4 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-yellow-900 font-bold rounded-lg border-2 border-yellow-500 transition-all duration-200"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          <button
            onClick={handleReset}
            className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg border-2 border-gray-300 transition-all duration-200"
          >
            Reset to Default
          </button>
        </div>

        {backgroundType === "custom" && (
          <p className="mt-3 text-xs text-gray-500">
            You are currently using a custom background.
          </p>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
