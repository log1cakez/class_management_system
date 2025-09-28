"use client";

import Image from "next/image";
import { RewardBadge } from "@/assets/images/badges";

interface BadgeDisplayProps {
  badge: RewardBadge;
  size?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
  className?: string;
}

export default function BadgeDisplay({ 
  badge, 
  size = 'medium', 
  showDescription = false,
  className = ""
}: BadgeDisplayProps) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden shadow-lg border-2 border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200`}>
        <Image
          src={badge.imagePath}
          alt={badge.name}
          fill
          className="object-cover"
          sizes={`${size === 'small' ? '48px' : size === 'medium' ? '64px' : '96px'}`}
        />
      </div>
      
      <div className="mt-2 text-center">
        <h3 className={`font-bold text-gray-800 ${textSizeClasses[size]}`}>
          {badge.name}
        </h3>
        
        {showDescription && (
          <p className={`text-gray-600 ${textSizeClasses[size]} mt-1`}>
            {badge.description}
          </p>
        )}
      </div>
    </div>
  );
}

// Component for displaying multiple badges
interface BadgeGridProps {
  badges: RewardBadge[];
  size?: 'small' | 'medium' | 'large';
  showDescription?: boolean;
  className?: string;
}

export function BadgeGrid({ 
  badges, 
  size = 'medium', 
  showDescription = false,
  className = ""
}: BadgeGridProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {badges.map((badge) => (
        <BadgeDisplay
          key={badge.id}
          badge={badge}
          size={size}
          showDescription={showDescription}
        />
      ))}
    </div>
  );
}

// Component for displaying a single badge with celebration effect
interface CelebratoryBadgeProps {
  badge: RewardBadge;
  onClose?: () => void;
}

export function CelebratoryBadge({ badge, onClose }: CelebratoryBadgeProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-bounce">
        <div className="mb-4">
          <BadgeDisplay badge={badge} size="large" showDescription />
        </div>
        
        <h2 className="text-2xl font-bold text-yellow-600 mb-2">
          🎉 Congratulations! 🎉
        </h2>
        
        <p className="text-gray-700 mb-6">
          You've earned the <strong>{badge.name}</strong> badge!
        </p>
        
        {onClose && (
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
          >
            Awesome!
          </button>
        )}
      </div>
    </div>
  );
}
