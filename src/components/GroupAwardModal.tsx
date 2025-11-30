"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IMAGES } from "@/assets/images/config";

interface Group {
  id: string;
  name: string;
  groupWorkId: string;
  students: {
    id: string;
    groupId: string;
    studentId: string;
    student: {
      id: string;
      name: string;
      classId: string;
    };
  }[];
}

interface Behavior {
  id: string;
  name: string;
  teacherId: string;
}

interface GroupWork {
  id: string;
  name: string;
  teacherId: string;
  classId?: string;
  groups: Group[];
  behaviors: {
    id: string;
    groupWorkId: string;
    behaviorId: string;
    behavior: Behavior;
  }[];
}

interface GroupAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (awards: {
    groupId: string;
    behaviorId: string;
    points: number;
  }[]) => void;
  groupWork: GroupWork | null;
}

export default function GroupAwardModal({
  isOpen,
  onClose,
  onConfirm,
  groupWork,
}: GroupAwardModalProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedBehavior, setSelectedBehavior] = useState<string>("");
  const [points, setPoints] = useState<number>(1);
  const [awards, setAwards] = useState<{
    groupId: string;
    behaviorId: string;
    points: number;
    groupName: string;
    behaviorName: string;
  }[]>([]);

  const resetForm = () => {
    setSelectedGroup("");
    setSelectedBehavior("");
    setPoints(1);
  };

  const addAward = () => {
    if (!selectedGroup || !selectedBehavior) {
      alert("Please select a group and behavior");
      return;
    }

    const group = groupWork?.groups.find((g) => g.id === selectedGroup);
    const behavior = groupWork?.behaviors.find((b) => b.behaviorId === selectedBehavior);

    if (!group || !behavior) {
      alert("Invalid selection");
      return;
    }

    const newAward = {
      groupId: selectedGroup,
      behaviorId: selectedBehavior,
      points,
      groupName: group.name,
      behaviorName: behavior.behavior.name,
    };

    setAwards([...awards, newAward]);
    resetForm();
  };

  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    if (awards.length === 0) {
      alert("Please add at least one award");
      return;
    }

    onConfirm(awards.map(({ groupId, behaviorId, points }) => ({
      groupId,
      behaviorId,
      points,
    })));
    
    // Clear the awards list after successful confirmation
    setAwards([]);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    setAwards([]);
    resetForm();
    onClose();
  };

  if (!isOpen || !groupWork) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal Background */}
      <div className="relative w-full h-full">
        <video
          src={IMAGES.HOMEPAGE_BG}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Modal Content */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-yellow-400">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="bg-yellow-400 text-yellow-900 font-bold py-4 px-8 rounded-xl shadow-lg border-2 border-yellow-600 text-xl inline-block">
                Award Behaviors to Groups
              </div>
              <p className="mt-2 text-lg text-gray-700 font-semibold">
                {groupWork.name}
              </p>
            </div>

            {/* Group Work Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-3">Group Work Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">Available Groups ({groupWork.groups.length}):</p>
                  <div className="text-sm text-blue-600">
                    {groupWork.groups.map(group => (
                      <div key={group.id}>
                        • {group.name} ({group.students.length} students)
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-700 mb-1">Targeted Behaviors ({groupWork.behaviors.length}):</p>
                  <div className="text-sm text-blue-600">
                    {groupWork.behaviors.map(b => (
                      <div key={b.behaviorId} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span className="font-medium">{b.behavior.name}</span>
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Targeted</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Award Form */}
            <div className="mb-6 p-6 bg-gray-100 rounded-xl">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Add Award</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Group
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select a group</option>
                    {groupWork.groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.students.length} students)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Behavior
                  </label>
                  <select
                    value={selectedBehavior}
                    onChange={(e) => setSelectedBehavior(e.target.value)}
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="">Select a behavior</option>
                    {groupWork.behaviors.map((b) => (
                      <option key={b.behaviorId} value={b.behaviorId}>
                        {b.behavior.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
              </div>

              <button
                onClick={addAward}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
              >
                Add Award
              </button>
            </div>

            {/* Awards List */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                Awards to be Given ({awards.length})
              </h3>
              
              {awards.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No awards added yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {awards.map((award, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg border-2 border-yellow-300"
                    >
                      <div>
                        <span className="font-bold text-yellow-800">{award.groupName}</span>
                        <span className="mx-2 text-yellow-700">→</span>
                        <span className="font-bold text-yellow-800">{award.behaviorName}</span>
                        <span className="mx-2 text-yellow-700">({award.points} points)</span>
                        <span className="text-sm text-yellow-600">- Predefined praise will be used</span>
                      </div>
                      <button
                        onClick={() => removeAward(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold transition-all duration-200 hover:scale-105"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={handleClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-3 border-gray-600 transition-all duration-200 hover:scale-105 text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-3 border-green-600 transition-all duration-200 hover:scale-105 text-lg"
              >
                Award Points ({awards.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
