import { useState, useEffect } from "react";

interface Behavior {
  id: string;
  name: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export function useBehaviors(teacherId: string | null) {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch behaviors for a teacher
  const fetchBehaviors = async () => {
    if (!teacherId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/behaviors?teacherId=${teacherId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch behaviors");
      }
      const data = await response.json();
      setBehaviors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Create a new behavior
  const createBehavior = async (name: string) => {
    if (!teacherId) throw new Error("No teacher ID");
    
    try {
      const response = await fetch("/api/behaviors", {
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
        throw new Error("Failed to create behavior");
      }

      const newBehavior = await response.json();
      setBehaviors((prev) => [...prev, newBehavior]);
      return newBehavior;
    } catch (err) {
      throw err;
    }
  };

  // Update a behavior
  const updateBehavior = async (id: string, name: string) => {
    if (!teacherId) throw new Error("No teacher ID");
    
    try {
      const response = await fetch(`/api/behaviors?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          teacherId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update behavior");
      }

      const updatedBehavior = await response.json();
      setBehaviors((prev) => 
        prev.map((b) => (b.id === id ? updatedBehavior : b))
      );
      return updatedBehavior;
    } catch (err) {
      throw err;
    }
  };

  // Delete a behavior
  const deleteBehavior = async (id: string) => {
    if (!teacherId) throw new Error("No teacher ID");
    
    try {
      const response = await fetch(`/api/behaviors?id=${id}&teacherId=${teacherId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete behavior");
      }

      setBehaviors((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      throw err;
    }
  };

  // Fetch behaviors when teacherId changes
  useEffect(() => {
    fetchBehaviors();
  }, [teacherId]);

  return {
    behaviors,
    loading,
    error,
    createBehavior,
    updateBehavior,
    deleteBehavior,
    refetch: fetchBehaviors,
  };
}
