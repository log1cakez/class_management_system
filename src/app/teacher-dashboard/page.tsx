"use client";

import { useState } from "react";
import Image from "next/image";
import { IMAGES } from "@/assets/images/config";
import { useClasses } from "@/hooks/useClasses";
import { useSearchParams } from "next/navigation";

export default function TeacherDashboardPage() {
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("teacherId");

  const { classes, loading, error, createClass, deleteClass } =
    useClasses(teacherId);

  const [newClassName, setNewClassName] = useState("");

  const addClass = async () => {
    if (newClassName.trim()) {
      try {
        await createClass(newClassName.trim().toUpperCase());
        setNewClassName("");
      } catch (error) {
        console.error("Error adding class:", error);
        alert("Failed to add class. Please try again.");
      }
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this class? This will also delete all students and their points."
      )
    ) {
      try {
        await deleteClass(classId);
      } catch (error) {
        console.error("Error deleting class:", error);
        alert("Failed to delete class. Please try again.");
      }
    }
  };

  const navigateToClass = (classId: string, className: string) => {
    window.location.href = `/dashboard?classId=${classId}&className=${encodeURIComponent(
      className
    )}&teacherId=${teacherId}`;
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={IMAGES.HOMEPAGE_BG}
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-20">
        {/* Header */}
        <div className="flex-1">
          <div className="bg-amber-100 rounded-2xl px-8 py-4 border-2 border-amber-800 shadow-lg mx-auto max-w-md">
            <h1 className="text-3xl font-bold text-orange-500 text-center drop-shadow-sm">
              Class Dashboard
            </h1>
          </div>
        </div>

        {/* Add Class Section */}
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
              Add Class
            </span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Enter class name..."
              className="px-4 py-3 bg-white bg-opacity-90 rounded-xl border-2 border-yellow-300 text-yellow-800 placeholder-yellow-500 focus:outline-none focus:border-yellow-500 shadow-lg text-lg font-semibold min-w-[300px]"
              onKeyPress={(e) => e.key === "Enter" && addClass()}
            />
            <button
              onClick={addClass}
              className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-800 font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg border-2 border-yellow-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-2xl font-bold text-yellow-600">
              Loading classes...
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

        {/* No Teacher Selected */}
        {!teacherId && !loading && (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-2xl font-bold text-yellow-600">
              Please login first
            </div>
          </div>
        )}

        {/* Classes Display Cards */}
        {!loading && !error && teacherId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-50 pl-50">
            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="bg-amber-100 bg-opacity-90 rounded-xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 relative cursor-pointer"
                onClick={() => navigateToClass(classItem.id, classItem.name)}
              >
                {/* Delete Button - Top Right */}
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClass(classItem.id);
                    }}
                    className="px-3 py-2 bg-red-400 hover:bg-red-500 text-white text-sm rounded-full transition-all duration-200 hover:scale-105 shadow-lg border-2 border-red-500"
                  >
                    ×
                  </button>
                </div>

                {/* Class Icon */}
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-yellow-500 shadow-lg">
                    <svg
                      className="w-12 h-12 text-yellow-800"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Class Name */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-yellow-600 drop-shadow-sm">
                    {classItem.name}
                  </h3>
                  <p className="text-sm text-yellow-500 mt-2">
                    Click to manage students
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && teacherId && classes.length === 0 && (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-4">
                No classes yet
              </div>
              <p className="text-lg text-yellow-500">
                Create your first class to get started!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Logout Button - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-20">
        <button
          onClick={() => {
            window.location.href = "/auth";
          }}
          className="px-6 py-3 bg-red-400 hover:bg-red-500 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg border-2 border-red-500"
        >
          Logout
        </button>
      </div>
    </main>
  );
}
