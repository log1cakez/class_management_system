"use client";

import { useState } from "react";
import GroupWorkModal from "./GroupWorkModal";
import GroupAwardModal from "./GroupAwardModal";
import { useGroupWorks } from "@/hooks/useGroupWorks";
import { useGroupPoints } from "@/hooks/useGroupPoints";

interface GroupWorkDemoProps {
  teacherId: string | null;
  classId?: string;
}

export default function GroupWorkDemo({ teacherId, classId }: GroupWorkDemoProps) {
  const { groupWorks, createGroupWork, updateGroupWork, loading } = useGroupWorks(teacherId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroupWork, setSelectedGroupWork] = useState<any>(null);

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
    reason: string;
  }[]) => {
    try {
      // Here you would use the useGroupPoints hook to award points
      // For now, just show a success message
      console.log("Awards to be given:", awards);
      alert(`Successfully awarded points to ${awards.length} groups!`);
      setShowAwardModal(false);
    } catch (error) {
      console.error("Error awarding points:", error);
      alert("Failed to award points. Please try again.");
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
                  {groupWork.groups.map((group) => (
                    <div key={group.id} className="text-sm text-gray-600">
                      • {group.name} ({group.students.length} students)
                    </div>
                  ))}
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
    </div>
  );
}
