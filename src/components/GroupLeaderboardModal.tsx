"use client";

import { useState } from "react";

interface GroupLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupWork: {
    id: string;
    name: string;
    groups: Array<{
      id: string;
      name: string;
      students: Array<{ id: string; name: string }>;
    }>;
  };
  groupPoints: Record<string, number>;
}

export default function GroupLeaderboardModal({
  isOpen,
  onClose,
  groupWork,
  groupPoints,
}: GroupLeaderboardModalProps) {
  if (!isOpen) return null;

  // Sort groups by points (descending)
  const sortedGroups = [...groupWork.groups]
    .map((group) => ({
      id: group.id,
      name: group.name,
      points: groupPoints[group.id] || 0,
      studentCount: group.students.length,
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-95 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">GROUP LEADERBOARD</h2>
              <p className="text-indigo-100 mt-1">{groupWork.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {sortedGroups.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">No groups found</div>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedGroups.map((group, index) => (
                <div
                  key={group.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300"
                      : index === 2
                      ? "bg-gradient-to-r from-orange-50 to-red-50 border-orange-300"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {index === 0 ? (
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          👑
                        </div>
                      ) : index === 1 ? (
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          🥈
                        </div>
                      ) : index === 2 ? (
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          🥉
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* Group Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                      <p className="text-sm text-gray-600">
                        {group.studentCount} {group.studentCount === 1 ? "student" : "students"}
                      </p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{group.points}</div>
                    <div className="text-sm text-gray-500">
                      {group.points === 1 ? "point" : "points"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
