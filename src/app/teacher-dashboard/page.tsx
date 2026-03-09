"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import Image from "next/image";
import { ICONS, IMAGES } from "@/assets/images/config";
import { useClasses } from "@/hooks/useClasses";
import { useSearchParams } from "next/navigation";

function TeacherDashboardContent() {
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("teacherId");

  const { classes, loading, error, createClass, updateClass, deleteClass } =
    useClasses(teacherId);

  const [newClassName, setNewClassName] = useState("");
  const [showUpdateCredentials, setShowUpdateCredentials] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [credentialsError, setCredentialsError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [editingClass, setEditingClass] = useState<{ id: string; name: string } | null>(null);
  const [editClassName, setEditClassName] = useState("");
  const [editClassLoading, setEditClassLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const openUpdateCredentials = async () => {
    setShowUpdateCredentials(true);
    setCredentialsError("");
    setCredentialsForm({
      name: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    if (teacherId) {
      try {
        const res = await fetch(`/api/teachers?id=${teacherId}`);
        if (res.ok) {
          const teacher = await res.json();
          setCredentialsForm((f) => ({ ...f, name: teacher.name ?? "" }));
        }
      } catch {
        setCredentialsError("Failed to load profile");
      }
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError("");
    if (!teacherId) return;
    if (!credentialsForm.name.trim() && !credentialsForm.newPassword.trim()) {
      setCredentialsError("Enter a new name and/or new password");
      return;
    }
    if (credentialsForm.newPassword) {
      if (credentialsForm.newPassword.length < 6) {
        setCredentialsError("New password must be at least 6 characters");
        return;
      }
      if (credentialsForm.newPassword !== credentialsForm.confirmNewPassword) {
        setCredentialsError("New passwords do not match");
        return;
      }
    }
    setCredentialsLoading(true);
    try {
      const res = await fetch("/api/teachers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          currentPassword: credentialsForm.currentPassword,
          name: credentialsForm.name.trim() || undefined,
          newPassword: credentialsForm.newPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setShowUpdateCredentials(false);
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem("teacher");
        if (stored) {
          const teacher = JSON.parse(stored);
          teacher.name = data.name;
          localStorage.setItem("teacher", JSON.stringify(teacher));
        }
      }
      alert("Credentials updated successfully!");
    } catch (error) {
      setCredentialsError(
        error instanceof Error ? error.message : "Failed to update credentials"
      );
    } finally {
      setCredentialsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This will permanently delete all your classes, students, and data. This action cannot be undone."
      )
    ) {
      try {
        const res = await fetch(`/api/teachers?id=${teacherId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete account");
        }
        window.location.href = "/auth";
      } catch (error) {
        console.error("Error deleting account:", error);
        alert(
          error instanceof Error ? error.message : "Failed to delete account. Please try again."
        );
      }
    }
  };

  const openEditClass = (classItem: { id: string; name: string }) => {
    setEditingClass(classItem);
    setEditClassName(classItem.name);
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassName.trim()) return;
    setEditClassLoading(true);
    try {
      await updateClass(editingClass.id, editClassName.trim().toUpperCase());
      setEditingClass(null);
    } catch (error) {
      console.error("Error updating class:", error);
      alert("Failed to update class. Please try again.");
    } finally {
      setEditClassLoading(false);
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

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-20">
        {/* Header */}
        <div className="flex-1">
          <div className="bg-[rgba(255,255,255,0.5)] rounded-2xl px-8 py-4 shadow-lg mx-auto max-w-md">
            <h1 className="text-3xl font-bold text-center drop-shadow-sm" style={{ color: "#F0B100" }}>
              CLASS DASHBOARD
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
                className="bg-[rgba(255,255,255,0.5)] rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 relative cursor-pointer"
                onClick={() => navigateToClass(classItem.id, classItem.name)}
              >
                {/* Edit & Delete Buttons - Top Right */}
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditClass(classItem);
                    }}
                    className="px-3 py-2 bg-blue-400 hover:bg-blue-500 text-white text-sm rounded-full transition-all duration-200 hover:scale-105 shadow-lg border-2 border-blue-500"
                    title="Edit class"
                  >
                    ✎
                  </button>
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
               <Image src={"/icons/blackboard.svg"} alt="Class Icon" width={100} height={100} />
                </div>

               
                {/* Class Name */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-yellow-600 drop-shadow-sm">
                    {classItem.name}
                  </h3>
                  <p className="text-sm text-yellow-500 mt-2">
                    Click to manage learners
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

      {/* Account Menu - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-20" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold rounded-xl transition-all duration-200 shadow-lg border-2 border-yellow-600"
        >
          Account
          <svg
            className={`w-5 h-5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-56 bg-white rounded-xl shadow-xl border-2 border-yellow-300 overflow-hidden">
            <button
              onClick={() => {
                setMenuOpen(false);
                openUpdateCredentials();
              }}
              disabled={!teacherId}
              className="w-full px-4 py-3 text-left hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-gray-800 border-b border-gray-100"
            >
              Update Credentials
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                window.location.href = "/auth";
              }}
              className="w-full px-4 py-3 text-left hover:bg-red-50 font-medium text-red-600 border-b border-gray-100"
            >
              Logout
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleDeleteUser();
              }}
              disabled={!teacherId}
              className="w-full px-4 py-3 text-left hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-red-600"
            >
              Delete User
            </button>
          </div>
        )}
      </div>

      {/* Edit Class Modal */}
      {editingClass && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/50"
          onClick={() => setEditingClass(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-yellow-400"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-yellow-700 mb-4">Edit Section</h2>
            <form onSubmit={handleUpdateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-800"
                  placeholder="Enter class name"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={editClassLoading}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {editClassLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Credentials Modal */}
      {showUpdateCredentials && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-yellow-400">
            <h2 className="text-xl font-bold text-yellow-700 mb-4">Update Credentials</h2>
            {credentialsError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {credentialsError}
              </div>
            )}
            <form onSubmit={handleUpdateCredentials} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={credentialsForm.name}
                  onChange={(e) =>
                    setCredentialsForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-800"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={credentialsForm.currentPassword}
                  onChange={(e) =>
                    setCredentialsForm((f) => ({ ...f, currentPassword: e.target.value }))
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-800"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={credentialsForm.newPassword}
                  onChange={(e) =>
                    setCredentialsForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-800"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={credentialsForm.confirmNewPassword}
                  onChange={(e) =>
                    setCredentialsForm((f) => ({ ...f, confirmNewPassword: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-gray-800"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={credentialsLoading}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  {credentialsLoading ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateCredentials(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TeacherDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">
              Loading teacher dashboard...
            </p>
          </div>
        </div>
      }
    >
      <TeacherDashboardContent />
    </Suspense>
  );
}
