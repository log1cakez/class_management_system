"use client";

import { useState } from "react";
import Image from "next/image";
import { IMAGES } from "@/assets/images/config";

interface Behavior {
  id: string;
  name: string;
  isSelected: boolean;
}

interface BehaviorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedBehaviors: string[]) => void;
  selectedStudents: string[];
}

const BEHAVIORS: Omit<Behavior, "isSelected">[] = [
  { id: "participate", name: "Participate" },
  { id: "following-instruction", name: "Following instruction" },
  { id: "sitting-properly", name: "Sitting properly" },
  { id: "finish-task-on-time", name: "Finish task on time" },
  { id: "listening-attentively", name: "Listening attentively" },
  { id: "stays-in-designated-place", name: "Stays in the designated place" },
  { id: "working-cooperatively", name: "Working cooperatively" },
  { id: "working-quietly", name: "Working quietly" },
];

export default function BehaviorSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  selectedStudents,
}: BehaviorSelectionModalProps) {
  const [behaviors, setBehaviors] = useState<Behavior[]>(
    BEHAVIORS.map((behavior) => ({ ...behavior, isSelected: false }))
  );

  const toggleBehavior = (id: string) => {
    setBehaviors(
      behaviors.map((behavior) =>
        behavior.id === id
          ? { ...behavior, isSelected: !behavior.isSelected }
          : behavior
      )
    );
  };

  const handleConfirm = () => {
    const selectedBehaviors = behaviors
      .filter((behavior) => behavior.isSelected)
      .map((behavior) => behavior.id);

    onConfirm(selectedBehaviors);
    onClose();
  };

  const selectedCount = behaviors.filter(
    (behavior) => behavior.isSelected
  ).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal Background */}
      <div className="relative w-full h-full">
        <Image
          src={IMAGES.HOMEPAGE_BG}
          alt="Behavior Selection Background"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={85}
        />

        {/* Modal Content */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-yellow-400">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="bg-yellow-400 text-yellow-900 font-bold py-4 px-8 rounded-xl shadow-lg border-2 border-yellow-600 text-xl inline-block">
                Select Behavior
              </div>
            </div>

            {/* Behavior Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {behaviors.map((behavior) => (
                <div key={behavior.id} className="flex items-center gap-4">
                  {/* Checkbox */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={behavior.isSelected}
                      onChange={() => toggleBehavior(behavior.id)}
                      className="w-7 h-7 text-yellow-600 bg-white border-3 border-yellow-600 rounded focus:ring-yellow-500 focus:ring-2"
                    />
                  </label>

                  {/* Behavior Button */}
                  <button
                    onClick={() => toggleBehavior(behavior.id)}
                    className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105 shadow-lg ${
                      behavior.isSelected
                        ? "bg-yellow-400 text-yellow-900 border-3 border-yellow-600 shadow-xl"
                        : "bg-yellow-300 text-yellow-800 border-3 border-yellow-500 hover:bg-yellow-400 hover:shadow-xl"
                    }`}
                  >
                    {behavior.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Selected Count Display */}
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-gray-700">
                Selected: {selectedCount} behavior
                {selectedCount !== 1 ? "s" : ""}({selectedCount} point
                {selectedCount !== 1 ? "s" : ""})
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-3 border-gray-600 transition-all duration-200 hover:scale-105 text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-3 border-green-600 transition-all duration-200 hover:scale-105 text-lg"
              >
                Confirm ({selectedCount} points)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
