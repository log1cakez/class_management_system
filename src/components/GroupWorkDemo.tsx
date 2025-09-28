"use client";

import { useState, useEffect } from "react";
import GroupWorkModal from "./GroupWorkModal";
import GroupAwardModal from "./GroupAwardModal";
import BadgeCelebrationModal from "./BadgeCelebrationModal";
import { useGroupWorks } from "@/hooks/useGroupWorks";
import { RewardBadge } from "@/assets/images/badges";

interface GroupWork {
  id: string;
  name: string;
  groups: Array<{
    id: string;
    name: string;
    students: Array<{
      student: {
        id: string;
        name: string;
      };
    }>;
  }>;
}

interface GroupWorkDemoProps {
  teacherId: string | null;
  classId?: string;
}

export default function GroupWorkDemo({ teacherId, classId }: GroupWorkDemoProps) {
  const { groupWorks, createGroupWork, updateGroupWork, deleteGroupWork, loading } = useGroupWorks(teacherId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<RewardBadge[]>([]);
  const [selectedGroupWork, setSelectedGroupWork] = useState<GroupWork | null>(null);
  const [groupPoints, setGroupPoints] = useState<Record<string, Record<string, number>>>({});

  // Fetch group points for all group works
  const fetchGroupPoints = async (groupWorks: GroupWork[]) => {
    try {
      const pointsData: Record<string, Record<string, number>> = {};
      
      for (const groupWork of groupWorks) {
        pointsData[groupWork.id] = {};
        
        for (const group of groupWork.groups) {
          const response = await fetch(`/api/group-work-awards?groupId=${group.id}`);
          if (response.ok) {
            const awards = await response.json();
            const totalPoints = awards.reduce((sum: number, award: { points: number }) => sum + award.points, 0);
            pointsData[groupWork.id][group.id] = totalPoints;
          } else {
            pointsData[groupWork.id][group.id] = 0;
          }
        }
      }
      
      setGroupPoints(pointsData);
    } catch (error) {
      console.error("Error fetching group points:", error);
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
    try {
      
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
    }
  };

  const openAwardModal = (groupWork: GroupWork) => {
    setSelectedGroupWork(groupWork);
    setShowAwardModal(true);
  };

  const openEditModal = (groupWork: GroupWork) => {
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
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
        >
          Create New Group Work
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">Loading group works...</div>
        </div>
      ) : groupWorks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-lg text-gray-600 mb-4">No group works created yet.</div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
          >
            Create Your First Group Work
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupWorks.map((groupWork) => (
            <div
              key={groupWork.id}
              className="bg-white rounded-xl shadow-lg border-2 border-yellow-300 p-6 hover:shadow-xl transition-all duration-200"
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
                        <span className="text-green-600 font-semibold">{points} pts</span>
                      </div>
                    );
                  })}
                </div>
              </div>

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

              <div className="flex gap-2">
                <button
                  onClick={() => openAwardModal(groupWork)}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm"
                >
                  Award Points
                </button>
                <button
                  onClick={() => openEditModal(groupWork)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteGroupWork(groupWork.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 text-sm"
                >
                  Delete
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
        initialData={selectedGroupWork || undefined}
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
