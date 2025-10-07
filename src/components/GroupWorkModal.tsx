"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IMAGES } from "@/assets/images/config";
import { useStudents } from "@/hooks/useStudents";
import { useBehaviors } from "@/hooks/useBehaviors";

interface Behavior {
  id: string;
  name: string;
  teacherId: string;
  isDefault?: boolean;
  isSelected: boolean;
  praise?: string;
}

interface Student {
  id: string;
  name: string;
  classId: string;
  isSelected: boolean;
}

interface Group {
  id?: string;
  name: string;
  studentIds: string[];
  students: Student[];
}

interface GroupWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (groupWork: {
    name: string;
    behaviorIds: string[];
    groups: Group[];
    behaviorNames?: Record<string, string>;
    behaviorPraises?: Record<string, string>;
  }) => void;
  teacherId: string | null;
  classId?: string;
  initialData?: any;
}

export default function GroupWorkModal({
  isOpen,
  onClose,
  onConfirm,
  teacherId,
  classId,
  initialData,
}: GroupWorkModalProps) {
  const { students: dbStudents } = useStudents(classId, teacherId);
  const { behaviors: dbBehaviors, refetch: refetchBehaviors } = useBehaviors(teacherId, 'GROUP_WORK');

  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activityName, setActivityName] = useState("");
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [behaviorPraises, setBehaviorPraises] = useState<Record<string, string>>({});
  const [isInSession, setIsInSession] = useState(false);

  // Initialize behaviors from database
  useEffect(() => {
    if (dbBehaviors && dbBehaviors.length > 0) {
      // Use real behaviors from database
      setBehaviors(
        dbBehaviors.map((behavior) => ({ ...behavior, isSelected: false }))
      );
    }
  }, [dbBehaviors]);

  // Update students when database students change
  useEffect(() => {
    setStudents(
      dbStudents.map((student) => ({ ...student, isSelected: false }))
    );
  }, [dbStudents]);

  const resetForm = (clearPraises = true) => {
    setActivityName("");
    setGroups([]);
    setBehaviors(behaviors.map(behavior => ({ ...behavior, isSelected: false })));
    setStudents(students.map(student => ({ ...student, isSelected: false })));
    setShowAddGroup(false);
    setNewGroupName("");
    if (clearPraises) {
      setBehaviorPraises({});
    }
  };

  // Ensure behaviors/options are present when opening (create or edit)
  useEffect(() => {
    if (!isOpen || !teacherId) return;
    // Refetch via hook to guarantee we have options
    refetchBehaviors && refetchBehaviors();
  }, [isOpen, teacherId, refetchBehaviors]);

  // Populate form when editing
  useEffect(() => {
    if (initialData && isOpen) {
      console.log('Loading initial data for editing:', initialData);
      console.log('Initial data behaviors:', initialData.behaviors);
      
      setActivityName(initialData.name || "");
      
      // Transform groups to match expected structure
      const transformedGroups = (initialData.groups || []).map((group: any) => ({
        id: group.id,
        name: group.name,
        studentIds: group.students?.map((s: any) => s.studentId || s.id) || [],
        students: group.students?.map((s: any) => ({
          id: s.studentId || s.id,
          name: s.student?.name || s.name || `Student ${s.studentId || s.id}`,
          teacherId: s.teacherId || teacherId || ""
        })) || []
      }));
      
      setGroups(transformedGroups);
      
      // Merge options from dbBehaviors with selected from initial data
      if (initialData.behaviors) {
        const selectedIds = initialData.behaviors.map((b: any) => b.behaviorId || b.id);

        // If no dbBehaviors yet, create list from initialData to avoid empty UI
        if (!dbBehaviors || dbBehaviors.length === 0) {
          const fromInitial = initialData.behaviors.map((b: any) => ({
            id: b.behaviorId || b.id,
            name: b.behavior?.name || b.name || 'Behavior',
            teacherId: teacherId || '',
            isSelected: true,
            praise: b.praise || undefined,
          }));
          setBehaviors(fromInitial);
        } else {
          setBehaviors(
            dbBehaviors.map((b: any) => ({
              id: b.id,
              name: b.name,
              teacherId: b.teacherId,
              isSelected: selectedIds.includes(b.id),
              praise: initialData.behaviors.find((ib: any) => (ib.behaviorId || ib.id) === b.id)?.praise || b.praise,
            }))
          );
        }
        
        // Load existing praise messages from initial data
        const existingPraises: Record<string, string> = {};
        initialData.behaviors.forEach((behavior: any) => {
          const behaviorId = behavior.behaviorId || behavior.id;
          console.log('Processing behavior:', { behaviorId, behavior, praise: behavior.praise });
          if (behavior.praise) {
            existingPraises[behaviorId] = behavior.praise;
          }
        });
        console.log('Loaded existing praises:', existingPraises);
        setBehaviorPraises(existingPraises);
      }
    } else if (isOpen && !initialData) {
      // Reset form when creating new, but preserve behavior praises if in session
      resetForm(!isInSession);
      setIsInSession(true);
    }
  }, [initialData, isOpen, teacherId, dbBehaviors]);


  const toggleBehavior = (id: string) => {
    const behavior = behaviors.find(b => b.id === id);
    const isCurrentlySelected = behavior?.isSelected || false;
    
    setBehaviors(
      behaviors.map((behavior) =>
        behavior.id === id
          ? { ...behavior, isSelected: !behavior.isSelected }
          : behavior
      )
    );
    
    // On select: prefill from existing praise (from DB or prior state) if available
    if (!isCurrentlySelected && behavior && behavior.praise && !behaviorPraises[id]) {
      setBehaviorPraises(prev => ({ ...prev, [id]: behavior.praise as string }));
    }

    // On deselect: preserve praise (do not delete) so it restores when re-selected
  };

  const toggleStudent = (id: string) => {
    // Check if student is already in a group
    const isAlreadyInGroup = groups.some(group => 
      group.students.some(student => student.id === id)
    );
    
    if (isAlreadyInGroup) {
      return; // Don't allow selection if already in a group
    }
    
    setStudents(
      students.map((student) =>
        student.id === id
          ? { ...student, isSelected: !student.isSelected }
          : student
      )
    );
  };

  const toggleSelectAllStudents = () => {
    // Get students that are not already in groups
    const availableStudents = students.filter(student => 
      !groups.some(group => group.students.some(s => s.id === student.id))
    );
    
    const allAvailableSelected = availableStudents.every(s => s.isSelected);
    
    setStudents(prevStudents =>
      prevStudents.map(student => {
        const isInGroup = groups.some(group => group.students.some(s => s.id === student.id));
        if (isInGroup) return student;
        return { ...student, isSelected: !allAvailableSelected };
      })
    );
  };

  const sortStudentsBy = (sortBy: 'name') => {
    setStudents(prevStudents => {
      const sorted = [...prevStudents].sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      return sorted;
    });
  };

  const addGroup = () => {
    if (newGroupName.trim()) {
      const selectedStudents = students.filter((student) => student.isSelected);
      const newGroup: Group = {
        name: newGroupName.trim(),
        studentIds: selectedStudents.map((s) => s.id),
        students: selectedStudents,
      };

      setGroups([...groups, newGroup]);
      setNewGroupName("");
      setShowAddGroup(false);

      // Clear student selections
      setStudents(students.map((student) => ({ ...student, isSelected: false })));
    }
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };

  // Add/Delete behavior controls removed; behaviors are managed globally via BehaviorManagementModal

  const removeBehavior = async (id: string) => {
    if (confirm("Are you sure you want to delete this behavior?")) {
      try {
        await deleteBehavior(id);
        // Remove the behavior from local state after successful deletion
        setBehaviors(prev => prev.filter(behavior => behavior.id !== id));
        // Remove the behavior's praise from behaviorPraises
        setBehaviorPraises(prev => {
          const newPraises = { ...prev };
          delete newPraises[id];
          return newPraises;
        });
      } catch (error) {
        console.error("Error deleting behavior:", error);
        alert("Failed to delete behavior. Please try again.");
      }
    }
  };

  const handleConfirm = () => {
    const selectedBehaviors = behaviors.filter((behavior) => behavior.isSelected);
    const selectedBehaviorIds = selectedBehaviors.map((behavior) => behavior.id);

    if (!activityName.trim()) {
      alert("Please enter an activity name");
      return;
    }

    if (selectedBehaviorIds.length === 0) {
      alert("Please select at least one behavior");
      return;
    }

    if (groups.length === 0) {
      alert("Please create at least one group");
      return;
    }

    // Check if all selected behaviors have praise messages
    const behaviorsWithoutPraise = selectedBehaviors.filter(behavior => 
      !behaviorPraises[behavior.id] || behaviorPraises[behavior.id].trim() === ''
    );

    if (behaviorsWithoutPraise.length > 0) {
      const behaviorNames = behaviorsWithoutPraise.map(b => b.name).join(', ');
      alert(`Please add praise messages for the following behaviors: ${behaviorNames}`);
      return;
    }

    // Create a mapping of behavior IDs to names
    const behaviorNames = selectedBehaviors.reduce((acc, behavior) => {
      acc[behavior.id] = behavior.name;
      return acc;
    }, {} as Record<string, string>);

    const behaviorPraisesData = selectedBehaviors.reduce((acc, behavior) => {
      acc[behavior.id] = behaviorPraises[behavior.id] || '';
      return acc;
    }, {} as Record<string, string>);

    onConfirm({
      name: activityName.trim(),
      classId,
      behaviorIds: selectedBehaviorIds,
      groups,
      behaviorNames,
      behaviorPraises: behaviorPraisesData,
    });
    
    resetForm();
    setIsInSession(false);
    onClose();
  };

  const selectedBehaviorCount = behaviors.filter(
    (behavior) => behavior.isSelected
  ).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal Background */}
      <div className="relative w-full h-full">
        <Image
          src={IMAGES.HOMEPAGE_BG}
          alt="Group Work Background"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={85}
        />

        {/* Modal Content */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-yellow-400">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="bg-yellow-400 text-yellow-900 font-bold py-4 px-8 rounded-xl shadow-lg border-2 border-yellow-600 text-xl inline-block">
                {initialData ? "Edit Group Work Activity" : "Create Group Work Activity"}
              </div>
            </div>

            {/* Activity Name */}
            <div className="mb-6">
              <label className="block text-lg font-bold text-gray-700 mb-2">
                Activity Name
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="Enter activity name..."
                className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-lg"
              />
            </div>


            {/* Behavior Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-700">
                  Select Target Behaviors ({selectedBehaviorCount} selected)
                </h3>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white">
                {behaviors.map((behavior) => (
                  <div key={behavior.id} className={`p-3 rounded-lg transition-colors ${behavior.isSelected ? 'bg-yellow-100 border border-yellow-300' : 'hover:bg-gray-50 border border-transparent'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <label className="flex items-center cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={behavior.isSelected}
                          onChange={() => toggleBehavior(behavior.id)}
                          className="w-5 h-5 text-yellow-600 bg-white border-2 border-yellow-600 rounded focus:ring-yellow-500 focus:ring-2"
                        />
                        <span className={`ml-2 font-medium ${behavior.isSelected ? 'text-yellow-800' : 'text-gray-700'}`}>
                          {behavior.name}
                        </span>
                        {behavior.isSelected && (
                          <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                            Selected
                          </span>
                        )}
                      </label>
                      {/* Remove per-activity delete; behaviors are managed in BehaviorManagementModal */}
                    </div>
                    
                    {behavior.isSelected && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Praise message for {behavior.name} (read-only):
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                          {(behaviorPraises[behavior.id] || behavior.praise || '').trim() || 'No praise defined'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Group Creation */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-700">
                  Groups ({groups.length})
                </h3>
                <button
                  onClick={() => setShowAddGroup(!showAddGroup)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  {showAddGroup ? "Cancel" : "Add Group"}
                </button>
              </div>

              {showAddGroup && (
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Enter group name..."
                      className="w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Select Students ({students.filter(s => s.isSelected).length} selected)
                    </label>
                    {(() => {
                      const assignedCount = groups.reduce((total, group) => total + group.students.length, 0);
                      const availableCount = students.length - assignedCount;
                      return (
                        <div className="text-xs text-gray-600 mb-2">
                          Available: {availableCount} students | Already assigned: {assignedCount} students
                        </div>
                      );
                    })()}
                    
                    {/* Control Buttons */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={toggleSelectAllStudents}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1 px-3 rounded transition-all duration-200 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        {students.filter(s => !groups.some(g => g.students.some(gs => gs.id === s.id))).every(s => s.isSelected) ? 'Deselect All' : 'Select All'}
                      </button>
                      <button
                        onClick={() => sortStudentsBy('name')}
                        className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold py-1 px-3 rounded transition-all duration-200 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                        Sort A-Z
                      </button>
                    </div>

                    {students.length === 0 ? (
                      <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          No students found for this class. Please make sure students are added to the class first.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white">
                        {students.map((student) => {
                          const isAlreadyInGroup = groups.some(group => 
                            group.students.some(s => s.id === student.id)
                          );
                          const assignedGroup = groups.find(group => 
                            group.students.some(s => s.id === student.id)
                          );
                          
                          return (
                            <label 
                              key={student.id} 
                              className={`flex items-center p-2 rounded transition-colors ${
                                isAlreadyInGroup 
                                  ? 'cursor-not-allowed bg-gray-100 opacity-60' 
                                  : 'cursor-pointer hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={student.isSelected}
                                onChange={() => toggleStudent(student.id)}
                                disabled={isAlreadyInGroup}
                                className={`w-5 h-5 rounded focus:ring-2 ${
                                  isAlreadyInGroup
                                    ? 'text-gray-400 bg-gray-200 border-2 border-gray-400 cursor-not-allowed'
                                    : 'text-green-600 bg-white border-2 border-green-600 focus:ring-green-500'
                                }`}
                              />
                              <div className="ml-3 flex-1">
                                <span className={`text-sm font-medium ${
                                  isAlreadyInGroup ? 'text-gray-500' : 'text-gray-700'
                                }`}>
                                  {student.name}
                                </span>
                                {isAlreadyInGroup && assignedGroup && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Already in: {assignedGroup.name}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={addGroup}
                    disabled={students.filter(s => s.isSelected).length === 0}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${
                      students.filter(s => s.isSelected).length === 0
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    Add Group
                  </button>
                  {students.filter(s => s.isSelected).length === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Please select at least one student
                    </p>
                  )}
                </div>
              )}

              {/* Display Groups */}
              <div className="space-y-2">
                {groups.map((group, index) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-100 rounded-lg border-2 border-yellow-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-yellow-800">{group.name}</span>
                        <span className="ml-2 text-sm text-yellow-700">
                          ({group.students.length} students)
                        </span>
                      </div>
                      <button
                        onClick={() => removeGroup(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold transition-all duration-200 hover:scale-105"
                      >
                        Remove
                      </button>
                    </div>
                    {group.students.length > 0 && (
                      <div className="text-xs text-yellow-700">
                        <div className="font-medium mb-1">Students:</div>
                        <div className="flex flex-wrap gap-1">
                          {group.students.map(s => (
                            <span key={s.id} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={() => {
                  resetForm();
                  setIsInSession(false);
                  onClose();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-3 border-gray-600 transition-all duration-200 hover:scale-105 text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-3 border-green-600 transition-all duration-200 hover:scale-105 text-lg"
              >
                {initialData ? "Update Activity" : "Create Activity"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
