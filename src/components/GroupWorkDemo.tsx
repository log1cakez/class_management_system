"use client";

import { useState, useEffect, useRef } from "react";
// import "./bubbleGlossyButton.css";
import GroupWorkModal from "./GroupWorkModal";
import GroupAwardModal from "./GroupAwardModal";
import BadgeCelebrationModal from "./BadgeCelebrationModal";
import GroupLeaderboardModal from "./GroupLeaderboardModal";
import { useGroupWorks } from "@/hooks/useGroupWorks";
import { RewardBadge } from "@/assets/images/badges";
import LoadingSpinner from "./LoadingSpinner";

interface GroupWorkDemoProps {
  teacherId: string | null;
  classId?: string;
  onLeaderboardChange?: (
    groups: { id: string; name: string; points: number }[],
  ) => void;
}

export default function GroupWorkDemo({
  teacherId,
  classId,
  onLeaderboardChange,
}: GroupWorkDemoProps) {
  const {
    groupWorks,
    createGroupWork,
    updateGroupWork,
    deleteGroupWork,
    loading,
    creatingGroupWork,
    updatingGroupWork,
    deletingGroupWork,
  } = useGroupWorks(teacherId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<RewardBadge[]>([]);
  const [selectedGroupWork, setSelectedGroupWork] = useState<any>(null);
  const [groupPoints, setGroupPoints] = useState<
    Record<string, Record<string, number>>
  >({});
  const [leaderboard, setLeaderboard] = useState<
    { id: string; name: string; points: number }[]
  >([]);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [selectedLeaderboardGroupWork, setSelectedLeaderboardGroupWork] =
    useState<any>(null);
  const [loadingGroupPoints, setLoadingGroupPoints] = useState(false);
  const [awardingPoints, setAwardingPoints] = useState(false);
  const [showOlderActivities, setShowOlderActivities] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch group points for all group works
  const fetchGroupPoints = async (groupWorks: any[]) => {
    setLoadingGroupPoints(true);
    try {
      const pointsData: Record<string, Record<string, number>> = {};

      for (const groupWork of groupWorks) {
        pointsData[groupWork.id] = {};

        for (const group of groupWork.groups) {
          const response = await fetch(
            `/api/group-work-awards?groupId=${group.id}`,
          );
          if (response.ok) {
            const awards = await response.json();
            const totalPoints = awards.reduce(
              (sum: number, award: any) => sum + award.points,
              0,
            );
            pointsData[groupWork.id][group.id] = totalPoints;
          } else {
            pointsData[groupWork.id][group.id] = 0;
          }
        }
      }

      setGroupPoints(pointsData);
      // Flatten to leaderboard entries
      const entries: { id: string; name: string; points: number }[] = [];
      for (const gw of groupWorks) {
        for (const group of gw.groups) {
          const pts = pointsData[gw.id]?.[group.id] || 0;
          entries.push({ id: group.id, name: group.name, points: pts });
        }
      }
      entries.sort((a, b) => b.points - a.points);
      setLeaderboard(entries);
      if (onLeaderboardChange) onLeaderboardChange(entries);
    } catch (error) {
      console.error("Error fetching group points:", error);
    } finally {
      setLoadingGroupPoints(false);
    }
  };

  // Fetch points when group works change
  useEffect(() => {
    if (groupWorks.length > 0) {
      fetchGroupPoints(groupWorks);
    }
  }, [groupWorks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowOlderActivities(false);
      }
    };

    if (showOlderActivities) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOlderActivities]);

  const handleCreateGroupWork = async (data: {
    name: string;
    classId?: string;
    behaviorIds: string[];
    groups: {
      name: string;
      studentIds: string[];
    }[];
    behaviorNames?: Record<string, string>;
  }) => {
    try {
      await createGroupWork(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating group work:", error);
      alert("Failed to create group work. Please try again.");
    }
  };

  const handleAwardPoints = async (
    awards: {
      groupId: string;
      behaviorId: string;
      points: number;
    }[],
  ) => {
    setAwardingPoints(true);
    try {
      console.log("Awards to be given:", awards);

      // Award points and badges to each group
      const awardPromises = awards.map(async (award) => {
        const response = await fetch("/api/group-work-awards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId: award.groupId,
            behaviorId: award.behaviorId,
            points: award.points,
            teacherId: teacherId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to award points to group ${award.groupId}`);
        }

        return response.json();
      });

      const results = await Promise.all(awardPromises);

      // Extract badges from results with praise messages and group names
      const badges = results
        .map((result, index) => {
          // Find the group name from the selected group work
          const group = selectedGroupWork?.groups.find(
            (g) => g.id === awards[index].groupId,
          );
          const groupName = group?.name || "Group";

          return {
            ...result.badge,
            praise: result.praise,
            groupName: groupName,
          };
        })
        .filter((badge) => badge.id && badge.id !== undefined);

      if (badges.length > 0) {
        setEarnedBadges(badges);
        setShowBadgeCelebration(true);
      } else {
        alert(`Successfully awarded points to ${awards.length} groups!`);
        setShowAwardModal(false);
      }

      // Refresh group points after awarding
      fetchGroupPoints(groupWorks);
    } catch (error) {
      console.error("Error awarding points:", error);
      alert("Failed to award points. Please try again.");
    } finally {
      setAwardingPoints(false);
    }
  };

  const openAwardModal = (groupWork: any) => {
    setSelectedGroupWork(groupWork);
    setShowAwardModal(true);
  };

  const openEditModal = (groupWork: any) => {
    setSelectedGroupWork(groupWork);
    setShowEditModal(true);
  };

  const openLeaderboardModal = (groupWork: any) => {
    setSelectedLeaderboardGroupWork(groupWork);
    setShowLeaderboardModal(true);
  };

  const handleEditGroupWork = async (data: {
    name: string;
    classId?: string;
    behaviorIds: string[];
    groups: {
      name: string;
      studentIds: string[];
    }[];
    behaviorPraises?: Record<string, string>;
  }) => {
    try {
      if (selectedGroupWork) {
        await updateGroupWork(selectedGroupWork.id, data);
        setShowEditModal(false);
        setSelectedGroupWork(null);
      }
    } catch (error) {
      console.error("Error updating group work:", error);
      alert("Failed to update group work. Please try again.");
    }
  };

  const handleDeleteGroupWork = async (groupWorkId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this group work activity? This action cannot be undone.",
      )
    ) {
      try {
        await deleteGroupWork(groupWorkId);
        alert("Group work activity deleted successfully!");
      } catch (error) {
        console.error("Error deleting group work:", error);
        alert("Failed to delete group work. Please try again.");
      }
    }
  };

  if (!teacherId) {
    return <div>Please log in to access group work features.</div>;
  }

  // Sort group works by createdAt (most recent first)
  const sortedGroupWorks = [...groupWorks].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Most recent first
  });

  // Get the latest activity (first in sorted array)
  const latestActivity = sortedGroupWorks[0];

  // Get older activities (all except the latest)
  const olderActivities = sortedGroupWorks.slice(1);

  // Determine which activity to display
  const displayedActivity = selectedActivityId
    ? sortedGroupWorks.find((gw) => gw.id === selectedActivityId) ||
      latestActivity
    : latestActivity;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={creatingGroupWork}
            style={{ backgroundColor: "#07AEFD" }}
            className="hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            {creatingGroupWork ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              "Create New Group Work"
            )}
          </button>

          {/* Dropdown for older activities */}
          {!loading && groupWorks.length > 0 && olderActivities.length > 0 && (
            <div className="relative ml-auto" ref={dropdownRef}>
              <button
                onClick={() => setShowOlderActivities(!showOlderActivities)}
                className="bg-[#84c018] hover:bg-[#6ea014] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${showOlderActivities ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                {selectedActivityId
                  ? `Viewing: ${displayedActivity?.name || "Activity"}`
                  : `View Older Activities (${olderActivities.length})`}
              </button>

              {showOlderActivities && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border-2 border-amber-300 z-10 min-w-[300px] max-h-96 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedActivityId(null);
                        setShowOlderActivities(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        !selectedActivityId
                          ? "bg-amber-100 text-amber-800 font-semibold"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      Latest: {latestActivity?.name}
                    </button>
                    {olderActivities.map((groupWork) => (
                      <button
                        key={groupWork.id}
                        onClick={() => {
                          setSelectedActivityId(groupWork.id);
                          setShowOlderActivities(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          selectedActivityId === groupWork.id
                            ? "bg-amber-100 text-amber-800 font-semibold"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {groupWork.name}
                        <span className="text-xs text-gray-500 ml-2">
                          ({new Date(groupWork.createdAt).toLocaleDateString()})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <LoadingSpinner size="lg" text="Loading group works..." />
        </div>
      ) : groupWorks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600 mb-4">
            No group works created yet.
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={creatingGroupWork}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            {creatingGroupWork ? (
              <>
                <LoadingSpinner size="sm" />
                Creating...
              </>
            ) : (
              "Create Your First Group Work"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Display the selected/latest activity */}
          {displayedActivity && (
            <div className="grid grid-cols-1 gap-6">
              {(() => {
                const groupWork = displayedActivity;
                return (
                  <div
                    key={groupWork.id}
                    className="bg-amber-100 bg-opacity-90 rounded-xl p-6 border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 relative"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {groupWork.name}
                    </h3>

                    <div className="mb-4 flex flex-row gap-4">
                      {/* Groups Box */}
                      <div className="flex-1 bg-[#FFF6D6] border-2 border-[#F7D77A] rounded-xl p-4 shadow" style={{ minWidth: 0 }}>
                        <p className="text-base font-bold text-[#D1A100] mb-2">
                          Groups <span className="font-normal text-gray-700">({groupWork.groups.length})</span>:
                        </p>
                        <div className="space-y-2">
                          {groupWork.groups.map((group, idx) => {
                            const points = groupPoints[groupWork.id]?.[group.id] || 0;
                            // Optional: Add emoji icons for group (demo only, you can map by idx or group name)
                            const groupIcons = [
                              '🐶', // paw patrol
                              '🐱', // meow patrol
                              '🐥', // quack patrol
                            ];
                            return (
                              <div
                                key={group.id}
                                className="flex items-center justify-between text-base font-medium text-[#3B2E07]"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="font-bold text-[#2B7A2B]">{group.name}</span>
                                  <span className="text-gray-500 font-normal">({group.students.length} students)</span>
                                </span>
                                <span className={`font-bold ${points > 0 ? 'text-[#2B7A2B]' : 'text-gray-500'}`}>{points} pt{points === 1 ? '' : 's'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      {/* Behaviors Box */}
                      <div className="flex-1 bg-[#DDF3D6] border-2 border-[#7ED957] rounded-xl p-4 shadow" style={{ minWidth: 0 }}>
                        <p className="text-base font-bold text-[#2B7A2B] mb-2">
                          Behaviors <span className="font-normal text-gray-700">({groupWork.behaviors.length})</span>:
                        </p>
                        <div className="space-y-2">
                          {groupWork.behaviors.map((b, idx) => {
                            return (
                              <div
                                key={b.behaviorId}
                                className="flex items-center justify-between text-base font-medium text-[#3B2E07]"
                              >
                                <span className="flex items-center gap-2">
                                  <span className="font-bold text-[#2B7A2B]">{b.behavior.name}</span>
                                </span>
                                <span className="font-bold text-[#2B7A2B]">+1 pt</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <button
                          onClick={() => openLeaderboardModal(groupWork)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Show Leaderboard
                        </button>
                        <div className="flex-1"></div>
                        <button
                          onClick={() => openEditModal(groupWork)}
                          disabled={updatingGroupWork}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm flex items-center justify-center gap-1"
                        >
                          {updatingGroupWork ? (
                            <>
                              <LoadingSpinner size="sm" />
                              Updating...
                            </>
                          ) : (
                            "Edit"
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteGroupWork(groupWork.id)}
                          disabled={deletingGroupWork}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm flex items-center justify-center gap-1"
                        >
                          {deletingGroupWork ? (
                            <>
                              <LoadingSpinner size="sm" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => openAwardModal(groupWork)}
                        disabled={awardingPoints || loadingGroupPoints}
                        className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm flex items-center justify-center gap-1 mx-auto"
                        style={{ width: '500px' }}
                      >
                        {awardingPoints ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Awarding...
                          </>
                        ) : (
                          "Award Points"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <GroupWorkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateGroupWork}
        teacherId={teacherId}
        classId={classId}
      />

      <GroupWorkModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGroupWork(null);
        }}
        onConfirm={handleEditGroupWork}
        teacherId={teacherId}
        classId={classId}
        initialData={selectedGroupWork}
      />

      <GroupAwardModal
        isOpen={showAwardModal}
        onClose={() => setShowAwardModal(false)}
        onConfirm={handleAwardPoints}
        groupWork={selectedGroupWork}
      />

      <BadgeCelebrationModal
        isOpen={showBadgeCelebration}
        badges={earnedBadges}
        onClose={() => {
          setShowBadgeCelebration(false);
          setEarnedBadges([]);
          setShowAwardModal(false);
        }}
      />

      <GroupLeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => {
          setShowLeaderboardModal(false);
          setSelectedLeaderboardGroupWork(null);
        }}
        groupWork={selectedLeaderboardGroupWork}
        groupPoints={
          selectedLeaderboardGroupWork
            ? groupPoints[selectedLeaderboardGroupWork.id] || {}
            : {}
        }
      />
    </div>
  );
}
