"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { DUCK_ICONS, IMAGES } from "@/assets/images/config";
import NavigationButtons from "@/components/NavigationButtons";
import { useStudents } from "@/hooks/useStudents";
import { useSearchParams, useRouter } from "next/navigation";
import GroupWorkModal from "@/components/GroupWorkModal";
import { useGroupWorks } from "@/hooks/useGroupWorks";
import LoadingSpinner from "@/components/LoadingSpinner";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const classId = searchParams.get("classId");
  const className = searchParams.get("className");
  const teacherId = searchParams.get("teacherId");

  const { students, loading, error, createStudent, creatingStudent } = useStudents(
    classId,
    teacherId
  );

  const [newStudentName, setNewStudentName] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showGroupWorkModal, setShowGroupWorkModal] = useState(false);

  const { createGroupWork, creatingGroupWork } = useGroupWorks(teacherId);

  const addStudent = async () => {
    if (newStudentName.trim()) {
      try {
        await createStudent(newStudentName.trim().toUpperCase());
        setNewStudentName("");
      } catch (error) {
        console.error("Error adding student:", error);
        alert("Failed to add student. Please try again.");
      }
    }
  };

  const removeStudent = (id: string) => {
    // For now, we'll just filter locally since we don't have a delete API
    // In a real app, you'd call a delete API here
    console.log("Remove student:", id);
  };

  const handleGroupWorkRedirect = () => {
    const params = new URLSearchParams();
    if (classId) params.set("classId", classId);
    if (className) params.set("className", className);
    if (teacherId) params.set("teacherId", teacherId);

    router.push(`/groupwork-dashboard?${params.toString()}`);
  };

  const handleCreateGroupWork = async (data: {
    name: string;
    behaviorIds: string[];
    groups: {
      name: string;
      studentIds: string[];
    }[];
  }) => {
    try {
      await createGroupWork(data);
      setShowGroupWorkModal(false);
      alert("Group work activity created successfully!");
    } catch (error) {
      console.error("Error creating group work:", error);
      alert("Failed to create group work. Please try again.");
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className={`absolute inset-0 z-0 transition-all duration-300 ${showTaskModal || showRewardsModal || showGroupWorkModal ? "blur-sm" : ""
          }`}
      >
        <Image
          src={IMAGES.HOMEPAGE_BG}
          alt="Dashboard Background"
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
      <div
        className={`relative z-10 min-h-screen p-8 transition-all duration-300 ${showTaskModal || showRewardsModal ? "blur-sm" : ""
          }`}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          {/* Dashboard Title */}
          <div className="flex-1">
            <div className="bg-amber-100 rounded-2xl px-8 py-4 border-2 border-amber-800 shadow-lg mx-auto max-w-md">
              <h1 className="text-3xl font-bold text-orange-500 text-center drop-shadow-sm">
                {className ? `${className} Dashboard` : "Class Dashboard"}
              </h1>
            </div>
          </div>

          {/* Navigation Buttons - Top Right */}
          <NavigationButtons
            homeButtonSize={80}
            backButtonSize={80}
            worksButtonSize={80}
            gap="gap-2"
            onWorksClick={() => setShowTaskModal(true)}
            homeUrl={
              teacherId
                ? `/teacher-dashboard?teacherId=${teacherId}`
                : "/teacher-dashboard"
            }
            backUrl={
              teacherId
                ? `/teacher-dashboard?teacherId=${teacherId}`
                : "/teacher-dashboard"
            }
          />
        </div>

        {/* Add Student Section - Top Left */}
        <div className="mb-8 pl-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-yellow-400 drop-shadow-lg">
              Add student
            </span>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Type name...."
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addStudent()}
              className="flex-1 max-w-md px-4 py-3 bg-yellow-300 border-2 border-white rounded-lg text-lg font-medium text-yellow-800 placeholder-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <button
              onClick={addStudent}
              disabled={creatingStudent}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-yellow-800 font-bold rounded-lg border-2 border-white transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
            >
              {creatingStudent ? (
                <>
                  <LoadingSpinner size="sm" />
                  Adding...
                </>
              ) : (
                "Add"
              )}
            </button>
          </div>
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
              <div
                key={student.id}
                className="bg-amber-100 bg-opacity-90 rounded-xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 relative"
              >
                {/* Points Display - Top Right */}
                <div className="absolute top-2 right-2 bg-yellow-400 px-4 py-3 rounded-full border-2 border-yellow-500 shadow-lg">
                  <span className="text-base font-bold text-yellow-800">
                    {student.points}
                  </span>
                </div>

                {/* Remove Button - Top Left */}
                <div className="absolute top-2 left-2">
                  <button
                    onClick={() => removeStudent(student.id)}
                    className="px-3 py-2 bg-red-400 hover:bg-red-500 text-white text-sm rounded-full transition-all duration-200 hover:scale-105 shadow-lg border-2 border-red-500"
                  >
                    ×
                  </button>
                </div>

                {/* Duck Character Placeholder */}
                <div className="mx-auto mb-4 flex items-center justify-center">
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
            ))}
          </div>
        )}
      </div>

      {/* Rewards Button - Bottom Left */}
      <div className="fixed bottom-8 left-8 z-20">
        <button
          onClick={() => setShowRewardsModal(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-800 font-bold py-4 px-6 rounded-full shadow-lg border-2 border-yellow-600 transition-all duration-200 hover:scale-105 flex items-center gap-3"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Rewards
        </button>
      </div>

      {/* Task Selection Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl w-full mx-4">
            {/* Modal Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Choose Task Type
              </h2>
              <p className="text-gray-600">
                Select how you want to assign points
              </p>
            </div>

            {/* Task Options */}
            <div className="flex gap-6 justify-center">
              {/* Individual Task Option */}
              <div
                className="bg-pink-400 hover:bg-pink-500 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg border-2 border-pink-500 min-w-[200px] text-center"
                onClick={() => {
                  setShowTaskModal(false);
                  window.location.href = `/individual_task${classId && teacherId
                    ? `?classId=${classId}&teacherId=${teacherId}`
                    : ""
                    }`;
                }}
              >
                <div className="text-2xl font-bold text-white mb-2">
                  Individual
                </div>
                <div className="text-xl font-bold text-white">Task</div>
                <div className="text-sm text-pink-100 mt-2">
                  Assign points to one student
                </div>
              </div>

              {/* Group Work Option */}
              <div
                className="bg-blue-500 hover:bg-blue-600 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg border-2 border-blue-600 min-w-[200px] text-center"
                onClick={() => {
                  setShowTaskModal(false);
                  handleGroupWorkRedirect();
                }}
              >
                <div className="text-2xl font-bold text-white mb-2">Group</div>
                <div className="text-xl font-bold text-white">Work</div>
                <div className="text-sm text-blue-100 mt-2">
                  Manage group work activities
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-6 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Modal */}
      {showRewardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="bg-yellow-100 rounded-3xl p-8 shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 drop-shadow-sm">
                Unlock Awesome Accessories for your Avatar!
              </h2>
            </div>

            {/* Reward Rows */}
            <div className="space-y-6">
              {/* Row 1 - Red Bow */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-400 rounded-full flex items-center justify-center border-2 border-red-500">
                    <span className="text-white font-bold text-lg">🎀</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Red Bow</h3>
                    <p className="text-gray-600">Earn 5 points to unlock</p>
                  </div>
                </div>
                <div className="bg-orange-400 px-4 py-2 rounded-full">
                  <span className="text-white font-bold">5</span>
                </div>
              </div>

              {/* Row 2 - Watch */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center border-2 border-green-500">
                    <span className="text-white font-bold text-lg">⌚</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Watch</h3>
                    <p className="text-gray-600">Earn 10 points to unlock</p>
                  </div>
                </div>
                <div className="bg-orange-400 px-4 py-2 rounded-full">
                  <span className="text-white font-bold">10</span>
                </div>
              </div>

              {/* Row 3 - Black Hat */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-600">
                    <span className="text-white font-bold text-lg">🎩</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Black Hat
                    </h3>
                    <p className="text-gray-600">Earn 20 points to unlock</p>
                  </div>
                </div>
                <div className="bg-orange-400 px-4 py-2 rounded-full">
                  <span className="text-white font-bold">20</span>
                </div>
              </div>

              {/* Row 4 - Blue Necklace */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center border-2 border-blue-500">
                    <span className="text-white font-bold text-lg">💎</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Blue Necklace
                    </h3>
                    <p className="text-gray-600">Earn 25 points to unlock</p>
                  </div>
                </div>
                <div className="bg-orange-400 px-4 py-2 rounded-full">
                  <span className="text-white font-bold">25</span>
                </div>
              </div>

              {/* Row 5 - Round Glasses */}
              <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center border-2 border-gray-500">
                    <span className="text-white font-bold text-lg">👓</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Round Glasses
                    </h3>
                    <p className="text-gray-600">Earn 30 points to unlock</p>
                  </div>
                </div>
                <div className="bg-orange-400 px-4 py-2 rounded-full">
                  <span className="text-white font-bold">30</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="text-center mt-8">
              <button
                onClick={() => setShowRewardsModal(false)}
                className="px-8 py-3 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Work Modal */}
      <GroupWorkModal
        isOpen={showGroupWorkModal}
        onClose={() => setShowGroupWorkModal(false)}
        onConfirm={handleCreateGroupWork}
        teacherId={teacherId}
        classId={classId}
      />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
