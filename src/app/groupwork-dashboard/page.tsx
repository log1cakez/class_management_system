"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { IMAGES } from "@/assets/images/config";
import NavigationButtons from "@/components/NavigationButtons";
import GroupWorkDemo from "@/components/GroupWorkDemo";
import GroupLeaderboard from "@/components/GroupLeaderboard";
import { useState } from "react";
import BehaviorManagementModal from "@/components/BehaviorManagementModal";

function GroupWorkDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const classId = searchParams.get("classId");
  const className = searchParams.get("className");
  const teacherId = searchParams.get("teacherId");

  const [showManageBehaviors, setShowManageBehaviors] = useState(false);
  const [groupsForLeaderboard, setGroupsForLeaderboard] = useState<{id:string;name:string;points:number}[]>([]);

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          src={IMAGES.HOMEPAGE_BG}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          {/* Group Work Title */}
          <div className="flex-1">
            <div className="bg-amber-100 rounded-2xl px-8 py-4 border-2 border-amber-800 shadow-lg mx-auto max-w-md">
              <h1 className="text-3xl font-bold text-orange-500 text-center drop-shadow-sm">
                GROUP WORK ACTIVITIES
              </h1>
            </div>
          </div>

          {/* Navigation Buttons - Top Right */}
          <NavigationButtons
            homeButtonSize={80}
            backButtonSize={80}
            worksButtonSize={80}
            gap="gap-2"
            onWorksClick={() => {}}
            homeUrl={
              teacherId
                ? `/teacher-dashboard?teacherId=${teacherId}`
                : "/teacher-dashboard"
            }
            backUrl={
              classId && teacherId
                ? `/dashboard?classId=${classId}&teacherId=${teacherId}`
                : "/dashboard"
            }
          />
        </div>

        {/* Main Content */}
        <div className="rounded-3xl p-8 max-w-6xl w-full mx-auto">
          {/* Class Name Display */}
          {className && (
            <div className="text-center mb-6">
              <div className="text-lg text-gray-700 font-semibold">
                Class: {className}
              </div>
            </div>
          )}

          {/* Manage Behaviors Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowManageBehaviors(true)}
              className="bg-amber-800 hover:bg-amber-900 text-white font-semibold py-2 px-6 rounded-lg shadow-lg border-2 border-amber-900 transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Manage Behaviors
            </button>
          </div>

          {/* Group Work Demo (leaderboards rendered per activity) */}
          <GroupWorkDemo 
            teacherId={teacherId} 
            classId={classId}
            onLeaderboardChange={(items)=>setGroupsForLeaderboard(items)}
          />
          <BehaviorManagementModal isOpen={showManageBehaviors} onClose={() => setShowManageBehaviors(false)} teacherId={teacherId} />
        </div>
      </div>
    </main>
  );
}

export default function GroupWorkDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading group work page...</p>
          </div>
        </div>
      }
    >
      <GroupWorkDashboardContent />
    </Suspense>
  );
}