"use client";

import { useState, useEffect } from "react";

interface ComplimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudents: Array<{
    id: string;
    name: string;
  }>;
  selectedBehaviors: Array<{
    id: string;
    name: string;
  }>;
  pointsAwarded: number;
}

export default function ComplimentModal({
  isOpen,
  onClose,
  selectedStudents,
  selectedBehaviors,
  pointsAwarded,
}: ComplimentModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  // Generate dynamic compliment message
  const generateComplimentMessage = () => {
    const studentNames = selectedStudents.map((s) => s.name).join(", ");
    const behaviorNames = selectedBehaviors
      .map((b) => b.name.toLowerCase())
      .join(", ");

    const compliments = [
      `Well done, ${studentNames}! Your ${behaviorNames} made a real difference – your voices mattered and truly brightened the discussion.`,
      `Excellent work, ${studentNames}! Your ${behaviorNames} shows great dedication and really contributed to our learning environment.`,
      `Outstanding effort, ${studentNames}! Your ${behaviorNames} demonstrates wonderful engagement and helps create a positive classroom atmosphere.`,
      `Fantastic job, ${studentNames}! Your ${behaviorNames} is exactly what makes our class special and inspiring for everyone.`,
      `Amazing work, ${studentNames}! Your ${behaviorNames} shows incredible commitment and makes our classroom a better place to learn.`,
    ];

    return compliments[Math.floor(Math.random() * compliments.length)];
  };

  const complimentMessage = generateComplimentMessage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal Background */}
      <div className="relative w-full h-full">
        {/* Placeholder Background - Replace with actual background image later */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-200 via-blue-100 to-green-200">
          {/* Placeholder clouds */}
          <div className="absolute top-10 left-10 w-20 h-10 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-20 right-20 w-16 h-8 bg-white rounded-full opacity-80"></div>
          <div className="absolute top-15 left-1/2 w-24 h-12 bg-white rounded-full opacity-80"></div>
        </div>

        {/* Modal Content */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div
            className={`bg-white bg-opacity-95 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-yellow-400 transition-all duration-300 ${
              isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {/* Stars Section */}
            <div className="text-center mb-8">
              {/* Placeholder Stars - Replace with actual star images later */}
              <div className="flex justify-center items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl">⭐</span>
                </div>
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>

              {/* Points Awarded */}
              <div className="bg-yellow-400 text-yellow-900 font-bold py-3 px-6 rounded-xl shadow-lg border-2 border-yellow-600 text-lg inline-block mb-4">
                {pointsAwarded} Point{pointsAwarded !== 1 ? "s" : ""} Awarded!
              </div>
            </div>

            {/* Compliment Message */}
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-2xl p-6 border-2 border-yellow-300 shadow-lg">
                <p className="text-lg font-semibold text-gray-800 leading-relaxed">
                  {complimentMessage}
                </p>
              </div>
            </div>

            {/* Selected Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Students */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-3 text-center">
                  Students Recognized
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedStudents.map((student) => (
                    <span
                      key={student.id}
                      className="bg-blue-400 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {student.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Behaviors */}
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <h3 className="text-lg font-bold text-green-800 mb-3 text-center">
                  Behaviors Demonstrated
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedBehaviors.map((behavior) => (
                    <span
                      key={behavior.id}
                      className="bg-green-400 text-green-900 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {behavior.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={handleClose}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-3 border-green-600 transition-all duration-200 hover:scale-105 text-lg"
              >
                Continue
              </button>
            </div>

            {/* Speaker Icon Placeholder */}
            <div className="absolute bottom-4 left-4">
              <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center opacity-60">
                <span className="text-white text-sm">🔊</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
