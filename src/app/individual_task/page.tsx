"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { DUCK_ICONS, IMAGES } from "@/assets/images/config";
import NavigationButtons from "@/components/NavigationButtons";
import BehaviorSelectionModal from "@/components/BehaviorSelectionModal";
import ComplimentModal from "@/components/ComplimentModal";
import { useStudents } from "@/hooks/useStudents";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import StudentLeaderboard from "@/components/StudentLeaderboard";

function IndividualTaskContent() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  const teacherId = searchParams.get("teacherId");

  const {
    students,
    loading,
    error,
    addPointsToStudents,
    toggleStudentSelection,
    toggleSelectAll,
    sortStudents,
    addingPoints,
  } = useStudents(classId, teacherId);

  const [isBehaviorModalOpen, setIsBehaviorModalOpen] = useState(false);
  const [isComplimentModalOpen, setIsComplimentModalOpen] = useState(false);
  const [complimentData, setComplimentData] = useState<{
    selectedStudents: Array<{ id: string; name: string }>;
    selectedBehaviors: Array<{ id: string; name: string }>;
    pointsAwarded: number;
  } | null>(null);

  const handleNextClick = () => {
    const selectedStudents = students.filter((student) => student.isSelected);
    if (selectedStudents.length === 0) {
      alert("Please select at least one student before proceeding.");
      return;
    }
    setIsBehaviorModalOpen(true);
  };

  const handleBehaviorConfirm = async (
    selectedBehaviors: Array<{ id: string; name: string }>
  ) => {
    const pointsToAdd = selectedBehaviors.length;
    const selectedStudentIds = students
      .filter((student) => student.isSelected)
      .map((student) => student.id);

    // Get selected students data
    const selectedStudentsData = students
      .filter((student) => student.isSelected)
      .map((student) => ({ id: student.id, name: student.name }));

    try {
      await addPointsToStudents(
        selectedStudentIds,
        pointsToAdd,
        "Behavior points",
        selectedBehaviors.map((b) => b.name).join(", ")
      );

      // Show compliment modal
      setComplimentData({
        selectedStudents: selectedStudentsData,
        selectedBehaviors: selectedBehaviors,
        pointsAwarded: pointsToAdd,
      });
      setIsComplimentModalOpen(true);
    } catch (error) {
      console.error("Error adding points:", error);

      // Show a more user-friendly error message
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to add points. Please try again.";

      // Check if this might be a false error (points were actually added)
      if (errorMessage.includes("Failed to update student points")) {
        // Give user option to check if points were added
        const shouldCheck = confirm(
          `Error: ${errorMessage}\n\n` +
            `This might be a temporary issue. Would you like to check if the points were actually added?\n\n` +
            `Click "OK" to refresh the page and check, or "Cancel" to try again.`
        );

        if (shouldCheck) {
          window.location.reload();
          return;
        }
      }

      alert(`Error: ${errorMessage}`);
    }
  };

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
          {/* Individual Task Title */}
          <div className="flex-1">
            <div className="rounded-2xl px-8 py-4 shadow-lg mx-auto max-w-md">
              <h1 className="text-4xl font-bold text-center drop-shadow-sm" style={{ color: "#FFDF73" }}>
                INDIVIDUAL TASK
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

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-96">
            <LoadingSpinner size="lg" text="Loading students..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-3xl font-bold text-red-600">
              Error: {error}
            </div>
          </div>
        )}

        {/* No Class Selected */}
        {!classId && !loading && (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-3xl font-bold text-yellow-600">
              Please select a class first
            </div>
          </div>
        )}

        {/* Student Display Cards + Leaderboard */}
        {!loading && !error && classId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
            {/* Control Buttons */}
            <div className="flex justify-center gap-4 mb-6">
              {/* Select All Button */}
              <button
                onClick={toggleSelectAll}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg border-2 border-blue-700 transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {students.every(s => s.isSelected) ? 'Deselect All' : 'Select All'}
              </button>

              {/* Sort by Name Button */}
              <button
                onClick={() => sortStudents('name')}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg border-2 border-purple-700 transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Sort by Name
              </button>

              {/* Sort by Points Button */}
              <button
                onClick={() => sortStudents('points')}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg border-2 border-green-700 transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                Sort by Points
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pr-50 pl-50">
            {students.map((student) => (
              <div key={student.id} className="bg-[rgba(255,255,255,0.5)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 relative">
                {/* Student Card */}
                <div className="student-card">
                  {/* Character with points badge */}
                  <div className="student-avatar">
                  <Image
                    src={
                      student.points >= 30
                        ? DUCK_ICONS.DUCK_6
                        : student.points >= 25
                          ? DUCK_ICONS.DUCK_5
                          : student.points >= 20
                            ? DUCK_ICONS.DUCK_4
                            : student.points >= 10
                              ? DUCK_ICONS.DUCK_3
                              : student.points >= 5
                                ? DUCK_ICONS.DUCK_2
                                : DUCK_ICONS.DUCK_1
                    }
                    alt={`duck level ${Math.floor(student.points / 5) + 1}`}
                      width={500}
                      height={500}
                      className=""
                    priority
                  />
                    {/* Points circle badge */}
                    <div className="student-points-badge">
                      {student.points ?? 0}
                    </div>
                </div>

                  {/* Student Name */}
                  <div className="student-name">
                    <h3>
                      {student.name}
                    </h3>
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex justify-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={student.isSelected}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500 focus:ring-2"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
            </div>
            {/* Right Leaderboard */}
            <div className="space-y-6">
              <StudentLeaderboard
                students={students.map(s => ({ id: s.id, name: s.name, points: s.points }))}
                title="Student Stars Leaderboard"
              />
            </div>
          </div>
        )}

        {/* NEXT Button - Bottom Right */}
        <div className="fixed bottom-8 right-8 z-20">
          <button
            onClick={handleNextClick}
            disabled={addingPoints}
            className="bg-amber-800 hover:bg-amber-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg shadow-lg border-2 border-amber-900 transition-all duration-200 hover:scale-105 flex items-center gap-3"
          >
            {addingPoints ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="text-xl">Processing...</span>
              </>
            ) : (
              <>
                <span className="text-xl">NEXT</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Behavior Selection Modal */}
      <BehaviorSelectionModal
        isOpen={isBehaviorModalOpen}
        onClose={() => setIsBehaviorModalOpen(false)}
        onConfirm={handleBehaviorConfirm}
        selectedStudents={students.filter((s) => s.isSelected).map((s) => s.id)}
        teacherId={teacherId}
        behaviorType="INDIVIDUAL"
      />

      {/* Compliment Modal */}
      {complimentData && (
        <ComplimentModal
          isOpen={isComplimentModalOpen}
          onClose={() => {
            setIsComplimentModalOpen(false);
            setComplimentData(null);
          }}
          selectedStudents={complimentData.selectedStudents}
          selectedBehaviors={complimentData.selectedBehaviors}
          pointsAwarded={complimentData.pointsAwarded}
        />
      )}
    </main>
  );
}

export default function IndividualTaskPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">Loading task page...</p>
          </div>
        </div>
      }
    >
      <IndividualTaskContent />
    </Suspense>
  );
}
