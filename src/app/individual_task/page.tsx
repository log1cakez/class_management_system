"use client";

import { useState } from "react";
import Image from "next/image";
import { DUCK_ICONS, IMAGES } from "@/assets/images/config";
import NavigationButtons from "@/components/NavigationButtons";
import BehaviorSelectionModal from "@/components/BehaviorSelectionModal";
import ComplimentModal from "@/components/ComplimentModal";
import { useStudents } from "@/hooks/useStudents";
import { useSearchParams } from "next/navigation";

export default function IndividualTaskPage() {
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  const teacherId = searchParams.get("teacherId");

  const {
    students,
    loading,
    error,
    addPointsToStudents,
    toggleStudentSelection,
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
      alert("Failed to add points. Please try again.");
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={IMAGES.HOMEPAGE_BG}
          alt="Individual Task Background"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          {/* Individual Task Title */}
          <div className="flex-1">
            <div className="bg-amber-100 rounded-2xl px-8 py-4 border-2 border-amber-800 shadow-lg mx-auto max-w-md">
              <h1 className="text-3xl font-bold text-orange-500 text-center drop-shadow-sm">
                Individual task
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
            <div className="text-2xl font-bold text-yellow-600">
              Loading students...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-2xl font-bold text-red-600">
              Error: {error}
            </div>
          </div>
        )}

        {/* No Class Selected */}
        {!classId && !loading && (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-2xl font-bold text-yellow-600">
              Please select a class first
            </div>
          </div>
        )}

        {/* Student Display Cards */}
        {!loading && !error && classId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-50 pl-50">
            {students.map((student) => (
              <div key={student.id} className="text-center">
                {/* Student Card */}
                <div className="bg-amber-100 bg-opacity-90 rounded-xl p-6 border-2 border-amber-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 mb-4">
                  {/* Duck Character */}
                  <div className="mx-auto mb-4 flex items-center justify-center">
                    <Image
                      src={
                        student.points >= 30
                          ? DUCK_ICONS.DUCK_5
                          : student.points >= 25
                          ? DUCK_ICONS.DUCK_4
                          : student.points >= 20
                          ? DUCK_ICONS.DUCK_3
                          : student.points >= 10
                          ? DUCK_ICONS.DUCK_2
                          : student.points >= 5
                          ? DUCK_ICONS.DUCK_1
                          : DUCK_ICONS.DUCK_1
                      }
                      alt={`duck level ${Math.floor(student.points / 25) + 1}`}
                      width={300}
                      height={300}
                      className="drop-shadow-lg"
                      priority
                    />
                  </div>

                  {/* Student Name */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-yellow-600 drop-shadow-sm">
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
                      className="w-5 h-5 text-yellow-600 bg-amber-100 border-2 border-amber-800 rounded focus:ring-yellow-500 focus:ring-2"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* NEXT Button - Bottom Right */}
        <div className="fixed bottom-8 right-8 z-20">
          <button
            onClick={handleNextClick}
            className="bg-amber-800 hover:bg-amber-900 text-white font-bold py-4 px-8 rounded-lg shadow-lg border-2 border-amber-900 transition-all duration-200 hover:scale-105 flex items-center gap-3"
          >
            <span className="text-lg">NEXT</span>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
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
