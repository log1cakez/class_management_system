// Badge configuration for reward system
export interface RewardBadge {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  behaviorTypes: ('INDIVIDUAL' | 'GROUP_WORK')[];
}

export const REWARD_BADGES: RewardBadge[] = [
  {
    id: 'collaboration-star',
    name: 'Collaboration Star',
    description: 'Excellent teamwork and cooperation',
    imagePath: '/images/Reward Badges/Picture23.png',
    behaviorTypes: ['GROUP_WORK']
  },
  {
    id: 'leadership-crown',
    name: 'Leadership Crown',
    description: 'Outstanding leadership skills',
    imagePath: '/images/Reward Badges/Picture24.png',
    behaviorTypes: ['GROUP_WORK']
  },
  {
    id: 'communication-champion',
    name: 'Communication Champion',
    description: 'Clear and effective communication',
    imagePath: '/images/Reward Badges/Picture25.png',
    behaviorTypes: ['GROUP_WORK']
  },
  {
    id: 'problem-solver',
    name: 'Problem Solver',
    description: 'Creative problem-solving abilities',
    imagePath: '/images/Reward Badges/Picture26.png',
    behaviorTypes: ['GROUP_WORK']
  },
  {
    id: 'active-participant',
    name: 'Active Participant',
    description: 'Engaged and involved in activities',
    imagePath: '/images/Reward Badges/Picture27.png',
    behaviorTypes: ['GROUP_WORK']
  },
  {
    id: 'respectful-listener',
    name: 'Respectful Listener',
    description: 'Attentive and respectful listening',
    imagePath: '/images/Reward Badges/Picture28.png',
    behaviorTypes: ['GROUP_WORK']
  },
  {
    id: 'idea-sharer',
    name: 'Idea Sharer',
    description: 'Contributes valuable ideas',
    imagePath: '/images/Reward Badges/Picture29.png',
    behaviorTypes: ['GROUP_WORK']
  },
  {
    id: 'team-supporter',
    name: 'Team Supporter',
    description: 'Supports and encourages teammates',
    imagePath: '/images/Reward Badges/Picture30.png',
    behaviorTypes: ['GROUP_WORK']
  },
  {
    id: 'instruction-follower',
    name: 'Instruction Follower',
    description: 'Follows directions carefully',
    imagePath: '/images/Reward Badges/Picture31.png',
    behaviorTypes: ['INDIVIDUAL']
  },
  {
    id: 'time-manager',
    name: 'Time Manager',
    description: 'Completes tasks on time',
    imagePath: '/images/Reward Badges/Picture32.png',
    behaviorTypes: ['INDIVIDUAL']
  },
  {
    id: 'focused-learner',
    name: 'Focused Learner',
    description: 'Maintains attention and focus',
    imagePath: '/images/Reward Badges/Picture33.png',
    behaviorTypes: ['INDIVIDUAL']
  },
  {
    id: 'responsible-student',
    name: 'Responsible Student',
    description: 'Takes responsibility for learning',
    imagePath: '/images/Reward Badges/Picture34.png',
    behaviorTypes: ['INDIVIDUAL']
  }
];

// Helper function to get badges for a specific behavior type
export function getBadgesForBehaviorType(behaviorType: 'INDIVIDUAL' | 'GROUP_WORK'): RewardBadge[] {
  return REWARD_BADGES.filter(badge => badge.behaviorTypes.includes(behaviorType));
}

// Helper function to get a random badge for a behavior type
export function getRandomBadgeForBehaviorType(behaviorType: 'INDIVIDUAL' | 'GROUP_WORK'): RewardBadge {
  const availableBadges = getBadgesForBehaviorType(behaviorType);
  const randomIndex = Math.floor(Math.random() * availableBadges.length);
  return availableBadges[randomIndex];
}

// Helper function to get a specific badge by ID
export function getBadgeById(id: string): RewardBadge | undefined {
  return REWARD_BADGES.find(badge => badge.id === id);
}
