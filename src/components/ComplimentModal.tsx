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
    const behaviorNames = selectedBehaviors
      .map((b) => b.name.toLowerCase())
      .join(", ");

    const compliments = [
      `Well done! Your ${behaviorNames} made a real difference – it truly brightened the discussion.`,
      `Excellent work! Your ${behaviorNames} shows great dedication and really contributed to our learning environment.`,
      `Outstanding effort! Your ${behaviorNames} demonstrates wonderful engagement and helps create a positive classroom atmosphere.`,
      `Fantastic job! Your ${behaviorNames} is exactly what makes our class special and inspiring for everyone.`,
      `Amazing work! Your ${behaviorNames} shows incredible commitment and makes our classroom a better place to learn.`,
    ];

    return compliments[Math.floor(Math.random() * compliments.length)];
  };

  const complimentMessage = generateComplimentMessage();

  // Function to highlight student names in the message
  const renderMessageWithHighlightedNames = (message: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    
    // Create a sorted list of student names by length (longest first) to avoid partial matches
    const sortedStudents = [...selectedStudents].sort((a, b) => b.name.length - a.name.length);
    
    // Find all student name occurrences with their positions
    const matches: Array<{ name: string; index: number; length: number }> = [];
    sortedStudents.forEach((student) => {
      // Escape special regex characters in the name
      const escapedName = student.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameRegex = new RegExp(`\\b${escapedName}\\b`, 'gi');
      let match;
      while ((match = nameRegex.exec(message)) !== null) {
        matches.push({
          name: student.name,
          index: match.index,
          length: match[0].length
        });
      }
    });
    
    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);
    
    // Remove overlapping matches (keep the first one)
    const nonOverlappingMatches: typeof matches = [];
    let lastEnd = 0;
    matches.forEach(match => {
      if (match.index >= lastEnd) {
        nonOverlappingMatches.push(match);
        lastEnd = match.index + match.length;
      }
    });
    
    // Build the parts array
    nonOverlappingMatches.forEach((match, i) => {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(message.substring(lastIndex, match.index));
      }
      
      // Add highlighted name
      parts.push(
        <span key={`highlight-${i}`} className="text-yellow-600 font-bold drop-shadow-sm">
          {match.name}
        </span>
      );
      
      lastIndex = match.index + match.length;
    });
    
    // Add remaining text
    if (lastIndex < message.length) {
      parts.push(message.substring(lastIndex));
    }
    
    // If no matches found, return the original message
    if (parts.length === 0) {
      return message;
    }
    
    return <>{parts}</>;
  };

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

            {/* Compliment Message & Details - Custom Layout */}
            <div className="flex flex-col items-center mb-8">
              {/* Compliment Box */}
              <div className="w-full max-w-2xl bg-gradient-to-b from-yellow-200 to-yellow-100 border-2 border-yellow-300 rounded-2xl shadow-lg p-6 mb-4 flex flex-col items-center">
                <p className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {complimentMessage.split('!')[0]}!
                </p>
                <p className="text-base text-gray-800 text-center">
                  {complimentMessage.split('!').slice(1).join('!').trim()}
                </p>
              </div>
              {/* Behavior Bar */}
              {selectedBehaviors.length > 0 && (
                <div className="w-full max-w-2xl flex justify-center mb-4">
                  <div className="bg-green-500 border-2 border-green-700 rounded-full px-6 py-2 shadow text-white font-bold text-base text-center">
                    Behavior Demonstrated: <span className="uppercase">{selectedBehaviors.map(b => b.name).join(', ')}</span>
                  </div>
                </div>
              )}
              {/* Students Recognized */}
              <div className="w-full max-w-2xl bg-white bg-opacity-80 rounded-2xl border-2 border-blue-200 shadow p-6 flex flex-col items-center">
                <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center tracking-wide">Students Recognized</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {selectedStudents.map((student) => (
                    <span
                      key={student.id}
                      className="bg-blue-400 text-white px-5 py-2 rounded-full text-base font-bold shadow border-2 border-blue-600 tracking-wide"
                      style={{ letterSpacing: '0.04em' }}
                    >
                      {student.name.toUpperCase()}
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
