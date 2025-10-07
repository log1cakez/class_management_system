"use client";

import { useState, useEffect } from "react";
import GroupWorkModal from "./GroupWorkModal";
import GroupAwardModal from "./GroupAwardModal";
import BadgeCelebrationModal from "./BadgeCelebrationModal";
import { useGroupWorks } from "@/hooks/useGroupWorks";
import { RewardBadge } from "@/assets/images/badges";
import LoadingSpinner from "./LoadingSpinner";

interface GroupWorkDemoProps {
  teacherId: string | null;
  classId?: string;
  onLeaderboardChange?: (groups: { id: string; name: string; points: number }[]) => void;
}

export default function GroupWorkDemo({ teacherId, classId, onLeaderboardChange }: GroupWorkDemoProps) {
  const { 
    groupWorks, 
    createGroupWork, 
    updateGroupWork, 
    deleteGroupWork, 
    loading,
    creatingGroupWork,
    updatingGroupWork,
    deletingGroupWork
  } = useGroupWorks(teacherId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<RewardBadge[]>([]);
  const [selectedGroupWork, setSelectedGroupWork] = useState<any>(null);
  const [groupPoints, setGroupPoints] = useState<Record<string, Record<string, number>>>({});
  const [leaderboard, setLeaderboard] = useState<{ id: string; name: string; points: number }[]>([]);
  const [leaderboardOpen, setLeaderboardOpen] = useState<Record<string, boolean>>({});
  const [loadingGroupPoints, setLoadingGroupPoints] = useState(false);
  const [awardingPoints, setAwardingPoints] = useState(false);

  // Fetch group points for all group works
  const fetchGroupPoints = async (groupWorks: any[]) => {
    setLoadingGroupPoints(true);
    try {
      const pointsData: Record<string, Record<string, number>> = {};
      
      for (const groupWork of groupWorks) {
        pointsData[groupWork.id] = {};
        
        for (const group of groupWork.groups) {
          const response = await fetch(`/api/group-work-awards?groupId=${group.id}`);
          if (response.ok) {
            const awards = await response.json();
            const totalPoints = awards.reduce((sum: number, award: any) => sum + award.points, 0);
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
      entries.sort((a,b)=>b.points-a.points);
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

  const handleAwardPoints = async (awards: {
    groupId: string;
    behaviorId: string;
    points: number;
  }[]) => {
    setAwardingPoints(true);
    try {
      console.log("Awards to be given:", awards);
      
      // Award points and badges to each group
      const awardPromises = awards.map(async (award) => {
        const response = await fetch('/api/group-work-awards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
      const badges = results.map((result, index) => {
        // Find the group name from the selected group work
        const group = selectedGroupWork?.groups.find(g => g.id === awards[index].groupId);
        const groupName = group?.name || 'Group';
        
        return {
          ...result.badge,
          praise: result.praise,
          groupName: groupName
        };
      }).filter(badge => badge.id && badge.id !== undefined);
      
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
    if (window.confirm("Are you sure you want to delete this group work activity? This action cannot be undone.")) {
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Group Work Activities</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={creatingGroupWork}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105 flex items-center gap-2"
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
      </div>

      {loading ? (
        <div className="text-center py-8">
          <LoadingSpinner size="lg" text="Loading group works..." />
        </div>
      ) : groupWorks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600 mb-4">No group works created yet.</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupWorks.map((groupWork) => (
            <div
              key={groupWork.id}
              className="bg-white rounded-xl shadow-lg border-2 border-yellow-300 p-6 pb-7 hover:shadow-xl transition-all duration-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{groupWork.name}</h3>
              
              {groupWork.class && (
                <p className="text-sm text-gray-600 mb-2">Class: {groupWork.class.name}</p>
              )}
              
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Groups ({groupWork.groups.length}):</p>
                <div className="space-y-1">
                  {groupWork.groups.map((group) => {
                    const points = groupPoints[groupWork.id]?.[group.id] || 0;
                    return (
                      <div key={group.id} className="text-sm text-gray-600 flex justify-between items-center">
                        <span>• {group.name} ({group.students.length} students)</span>
                        <span className="text-green-600 font-semibold">{points} {points === 1 ? 'pt' : 'pts'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Leaderboard (toggle) */}
              <div className="mb-2">
                <button
                  onClick={() => setLeaderboardOpen(prev => ({ ...prev, [groupWork.id]: !prev[groupWork.id] }))}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm"
                >
                  {leaderboardOpen[groupWork.id] ? 'Hide Leaderboard' : 'Show Leaderboard'}
                </button>
              </div>
              {leaderboardOpen[groupWork.id] && (
                <div className="mb-4">
                  {(() => {
                    const entries = [...groupWork.groups]
                      .map((g: any) => ({ id: g.id, name: g.name, points: groupPoints[groupWork.id]?.[g.id] || 0 }))
                      .sort((a, b) => b.points - a.points);
                    return (
                      <ul className="space-y-2 rounded-2xl p-3 bg-gradient-to-br from-emerald-50 via-cyan-50 to-indigo-50 border border-emerald-200">
                        {entries.map((e, idx) => (
                          <li key={e.id} className={`flex items-center justify-between px-3 py-2 rounded-xl bg-white border ${idx < 3 ? 'border-emerald-300' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-2">
                              <span className="w-6 text-center">{idx === 0 ? '👑' : idx === 1 ? '🎖️' : idx === 2 ? '🏅' : idx + 1}</span>
                              <span className="font-medium text-gray-800">{e.name}</span>
                            </div>
                            <span className="text-indigo-700 font-bold">{e.points} {e.points === 1 ? 'pt' : 'pts'}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Behaviors ({groupWork.behaviors.length}):</p>
                <div className="space-y-1">
                  {groupWork.behaviors.map((b) => (
                    <div key={b.behaviorId} className="text-sm text-gray-600">
                      • {b.behavior.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                <button
                  onClick={() => openAwardModal(groupWork)}
                  disabled={awardingPoints || loadingGroupPoints}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm flex items-center justify-center gap-1"
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
            </div>
          ))}
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
    </div>
  );
}
