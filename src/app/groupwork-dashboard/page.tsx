"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { IMAGES } from "@/assets/images/config";
import NavigationButtons from "@/components/NavigationButtons";
import GroupWorkDemo from "@/components/GroupWorkDemo";

function GroupWorkDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const classId = searchParams.get("classId");
  const className = searchParams.get("className");
  const teacherId = searchParams.get("teacherId");

  const handleBackClick = () => {
    const params = new URLSearchParams();
    if (classId) params.set("classId", classId);
    if (className) params.set("className", className);
    if (teacherId) params.set("teacherId", teacherId);
    
    const dashboardUrl = `/dashboard?${params.toString()}`;
    router.push(dashboardUrl);
  };

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

      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={handleBackClick}
          className="flex items-center justify-center transition-all duration-200 hover:scale-110 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
          style={{
            width: 100,
            height: 100,
          }}
          title="Back to Dashboard"
        >
          <svg
            className="drop-shadow-lg text-white"
            width={50}
            height={50}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>


      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
        <div className="bg-white bg-opacity-95 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-blue-400">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="bg-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-2 border-blue-600 text-xl inline-block">
              Group Work Dashboard
            </div>
            {className && (
              <div className="mt-4 text-lg text-gray-700 font-semibold">
                Class: {className}
              </div>
            )}
          </div>

          {/* Group Work Demo Component */}
          <GroupWorkDemo teacherId={teacherId} classId={classId} />
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