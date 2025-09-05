import { useState, useEffect } from "react";

interface Class {
  id: string;
  name: string;
  teacherId: string;
}

export function useClasses(teacherId: string | null) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch classes for a teacher
  const fetchClasses = async () => {
    if (!teacherId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/classes?teacherId=${teacherId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Create a new class
  const createClass = async (name: string) => {
    if (!teacherId) throw new Error("No teacher ID");
    
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          teacherId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create class");
      }

      const newClass = await response.json();
      setClasses((prev) => [...prev, newClass]);
    } catch (err) {
      throw err;
    }
  };

  // Delete a class
  const deleteClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}?teacherId=${teacherId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete class");
      }

      setClasses((prev) => prev.filter((c) => c.id !== classId));
    } catch (err) {
      throw err;
    }
  };

  // Fetch classes when teacherId changes
  useEffect(() => {
    fetchClasses();
  }, [teacherId]);

  return {
    classes,
    loading,
    error,
    createClass,
    deleteClass,
    refetch: fetchClasses,
  };
}