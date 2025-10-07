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
    <main className="relative w-full h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={IMAGES.HOMEPAGE_BG}
          alt="Group Work Dashboard Background"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={85}
        />
      </div>



      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
        {/* Top-right Navigation Buttons */}
        <div className="absolute top-6 right-6">
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
        <div className="bg-white bg-opacity-95 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-blue-400">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="bg-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-2 border-blue-600 text-xl inline-block">
              Group Work Activities
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowManageBehaviors(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
              >
                Manage Behaviors
              </button>
            </div>
            {className && (
              <div className="mt-4 text-lg text-gray-700 font-semibold">
                Class: {className}
              </div>
            )}
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
    <Suspense fallback={<div>Loading...</div>}>
      <GroupWorkDashboardContent />
    </Suspense>
  );
}