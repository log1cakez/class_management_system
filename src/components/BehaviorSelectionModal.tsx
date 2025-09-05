"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { IMAGES } from "@/assets/images/config";
import { useBehaviors } from "@/hooks/useBehaviors";

interface Behavior {
  id: string;
  name: string;
  isSelected: boolean;
}

interface BehaviorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedBehaviors: Array<{ id: string; name: string }>) => void;
  selectedStudents: string[];
  teacherId: string | null;
}

export default function BehaviorSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  selectedStudents,
  teacherId,
}: BehaviorSelectionModalProps) {
  const {
    behaviors: dbBehaviors,
    loading,
    error,
    createBehavior,
    updateBehavior,
    deleteBehavior,
  } = useBehaviors(teacherId);

  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<string | null>(null);
  const [newBehaviorName, setNewBehaviorName] = useState("");
  const [editBehaviorName, setEditBehaviorName] = useState("");

  // Update behaviors when database behaviors change
  useEffect(() => {
    if (dbBehaviors.length > 0) {
      setBehaviors(
        dbBehaviors.map((behavior) => ({ ...behavior, isSelected: false }))
      );
    } else {
      // Fallback to default behaviors if no custom behaviors exist
      const defaultBehaviors = [
        { id: "participate", name: "Participate" },
        { id: "following-instruction", name: "Following instruction" },
        { id: "sitting-properly", name: "Sitting properly" },
        { id: "finish-task-on-time", name: "Finish task on time" },
        { id: "listening-attentively", name: "Listening attentively" },
        {
          id: "stays-in-designated-place",
          name: "Stays in the designated place",
        },
        { id: "working-cooperatively", name: "Working cooperatively" },
        { id: "working-quietly", name: "Working quietly" },
      ];
      setBehaviors(
        defaultBehaviors.map((behavior) => ({ ...behavior, isSelected: false }))
      );
    }
  }, [dbBehaviors]);

  const toggleBehavior = (id: string) => {
    setBehaviors(
      behaviors.map((behavior) =>
        behavior.id === id
          ? { ...behavior, isSelected: !behavior.isSelected }
          : behavior
      )
    );
  };

  const handleAddBehavior = async () => {
    if (newBehaviorName.trim() && teacherId) {
      try {
        await createBehavior(newBehaviorName.trim());
        setNewBehaviorName("");
        setShowAddForm(false);
      } catch (error) {
        console.error("Error adding behavior:", error);
        alert("Failed to add behavior. Please try again.");
      }
    }
  };

  const handleEditBehavior = async (id: string) => {
    if (editBehaviorName.trim() && teacherId) {
      try {
        await updateBehavior(id, editBehaviorName.trim());
        setEditBehaviorName("");
        setShowEditForm(null);
      } catch (error) {
        console.error("Error updating behavior:", error);
        alert("Failed to update behavior. Please try again.");
      }
    }
  };

  const handleDeleteBehavior = async (id: string) => {
    if (confirm("Are you sure you want to delete this behavior?")) {
      try {
        await deleteBehavior(id);
      } catch (error) {
        console.error("Error deleting behavior:", error);
        alert("Failed to delete behavior. Please try again.");
      }
    }
  };

  const startEdit = (id: string, currentName: string) => {
    setEditBehaviorName(currentName);
    setShowEditForm(id);
  };

  const handleConfirm = () => {
    const selectedBehaviors = behaviors
      .filter((behavior) => behavior.isSelected)
      .map((behavior) => ({ id: behavior.id, name: behavior.name }));

    onConfirm(selectedBehaviors);
    onClose();
  };

  const selectedCount = behaviors.filter(
    (behavior) => behavior.isSelected
  ).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Modal Background */}
      <div className="relative w-full h-full">
        <Image
          src={IMAGES.HOMEPAGE_BG}
          alt="Behavior Selection Background"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={85}
        />

        {/* Modal Content */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-yellow-400">
            {/* Title */}
            <div className="text-center mb-8">
              <div className="bg-yellow-400 text-yellow-900 font-bold py-4 px-8 rounded-xl shadow-lg border-2 border-yellow-600 text-xl inline-block">
                Select Behavior
              </div>
            </div>

            {/* Add Behavior Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-700">
                  Manage Behaviors
                </h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                >
                  {showAddForm ? "Cancel" : "Add Behavior"}
                </button>
              </div>

              {showAddForm && (
                <div className="flex items-center gap-4 mb-4 p-4 bg-gray-100 rounded-lg">
                  <input
                    type="text"
                    value={newBehaviorName}
                    onChange={(e) => setNewBehaviorName(e.target.value)}
                    placeholder="Enter behavior name..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    onKeyPress={(e) => e.key === "Enter" && handleAddBehavior()}
                  />
                  <button
                    onClick={handleAddBehavior}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Behavior Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {behaviors.map((behavior) => (
                <div key={behavior.id} className="flex items-center gap-4">
                  {/* Checkbox */}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={behavior.isSelected}
                      onChange={() => toggleBehavior(behavior.id)}
                      className="w-7 h-7 text-yellow-600 bg-white border-3 border-yellow-600 rounded focus:ring-yellow-500 focus:ring-2"
                    />
                  </label>

                  {/* Behavior Content */}
                  <div className="flex-1 flex items-center gap-2">
                    {showEditForm === behavior.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editBehaviorName}
                          onChange={(e) => setEditBehaviorName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleEditBehavior(behavior.id)
                          }
                        />
                        <button
                          onClick={() => handleEditBehavior(behavior.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowEditForm(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleBehavior(behavior.id)}
                          className={`flex-1 py-4 px-6 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105 shadow-lg ${
                            behavior.isSelected
                              ? "bg-yellow-400 text-yellow-900 border-3 border-yellow-600 shadow-xl"
                              : "bg-yellow-300 text-yellow-800 border-3 border-yellow-500 hover:bg-yellow-400 hover:shadow-xl"
                          }`}
                        >
                          {behavior.name}
                        </button>

                        {/* Edit/Delete Buttons */}
                        {teacherId && (
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                startEdit(behavior.id, behavior.name)
                              }
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold transition-all duration-200 hover:scale-105"
                              title="Edit behavior"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteBehavior(behavior.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold transition-all duration-200 hover:scale-105"
                              title="Delete behavior"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Count Display */}
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-gray-700">
                Selected: {selectedCount} behavior
                {selectedCount !== 1 ? "s" : ""}({selectedCount} point
                {selectedCount !== 1 ? "s" : ""})
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-3 border-gray-600 transition-all duration-200 hover:scale-105 text-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg border-3 border-green-600 transition-all duration-200 hover:scale-105 text-lg"
              >
                Confirm ({selectedCount} points)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
