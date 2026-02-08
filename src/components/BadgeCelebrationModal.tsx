"use client";

import { useState, useEffect } from "react";
import { CelebratoryBadge } from "@/components/BadgeDisplay";
import { RewardBadge } from "@/assets/images/badges";

interface BadgeCelebrationModalProps {
  isOpen: boolean;
  badges: (RewardBadge & { praise?: string; groupName?: string })[];
  onClose: () => void;
}

export default function BadgeCelebrationModal({ 
  isOpen, 
  badges, 
  onClose 
}: BadgeCelebrationModalProps) {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (isOpen && badges.length > 0) {
      setCurrentBadgeIndex(0);
      // Ensure content shows immediately
      setShowBadge(true);
      setShowConfetti(true);
      setShowSparkles(true);
      
      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen, badges]);

  const handleNextBadge = () => {
    if (currentBadgeIndex < badges.length - 1) {
      setCurrentBadgeIndex(currentBadgeIndex + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setShowBadge(false);
    setShowConfetti(false);
    setShowSparkles(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!isOpen || badges.length === 0) return null;

  const currentBadge = badges[currentBadgeIndex];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 backdrop-blur-md"></div>
      
      {/* Magical sparkles background */}
      {showSparkles && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <div className="w-2 h-2 bg-yellow-300 rounded-full opacity-70"></div>
            </div>
          ))}
        </div>
      )}
      
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div 
                className={`w-3 h-3 rounded-full ${
                  ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'][Math.floor(Math.random() * 6)]
                } opacity-80`}
              ></div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal content with magical entrance */}
      <div className={`relative bg-transparent p-8 max-w-2xl mx-4 text-center transform transition-all duration-700 z-10 ${
        showBadge ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 rotate-12'
      }`}>
        
        {/* Badge with magical animation */}
        <div className="mb-6 relative">
          <div className={`w-48 h-48 relative rounded-full overflow-hidden mx-auto transform transition-all duration-1000 ${
            showBadge ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
          }`}>
            
            <img
              src={currentBadge.imagePath}
              alt={currentBadge.name}
              className="w-full h-full object-cover relative z-20 animate-pulse rounded-full"
            />
            
            {/* Magical sparkles around badge */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                  style={{
                    left: `${20 + (i * 10)}%`,
                    top: `${20 + (i * 10)}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1.5s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Title with magical text effect */}
        <h2 className={`text-3xl font-bold bg-gradient-to-r from-yellow-600 via-red-500 to-pink-500 bg-clip-text text-transparent mb-3 transform transition-all duration-1000 relative z-10 ${
          showBadge ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          CONGRATULATIONS {currentBadge.groupName ? `"${currentBadge.groupName}"` : ''}!
        </h2>
        
        <p className={`text-lg text-gray-700 mb-3 font-semibold transform transition-all duration-1000 delay-200 relative z-10 ${
          showBadge ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          You've earned a badge!
        </p>
        
        <p className={`text-xl text-gray-800 mb-6 font-bold transform transition-all duration-1000 delay-400 relative z-10 ${
          showBadge ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          "{currentBadge.praise || currentBadge.description}"
        </p>
        
        {/* Badge counter with magical effect */}
        {badges.length > 1 && (
          <div className={`text-sm text-gray-500 mb-4 transform transition-all duration-1000 delay-600 relative z-10 ${
            showBadge ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="inline-flex items-center gap-2 px-3 py-1">
              <span className="text-blue-600 font-semibold">{currentBadgeIndex + 1}</span>
              <span className="text-gray-600">of</span>
              <span className="text-purple-600 font-semibold">{badges.length}</span>
              <span className="text-gray-600">badges</span>
            </div>  
          </div>
        )}
        
        {/* Magical button */}
        <div className={`transform transition-all duration-1000 delay-800 relative z-10 ${
          showBadge ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <button
            onClick={handleNextBadge}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
          >
            {currentBadgeIndex < badges.length - 1 ? 'Next Badge' : 'Awesome!'}
          </button>
        </div>
        
        {/* Magical border animation */}
        {/* <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-yellow-400 via-red-400 to-blue-400 animate-pulse -z-10" style={{
          background: 'linear-gradient(45deg, #fbbf24, #ef4444, #3b82f6, #8b5cf6, #fbbf24)',
          backgroundSize: '400% 400%',
          animation: 'gradient 3s ease infinite'
        }}></div> */}
      </div>
      
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
