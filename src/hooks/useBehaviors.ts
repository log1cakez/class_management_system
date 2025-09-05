import { useState, useEffect, useCallback } from "react";

interface Behavior {
  id: string;
  name: string;
  teacherId: string;
  isDefault?: boolean;
}

export function useBehaviors(teacherId: string | null) {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBehaviors = useCallback(async () => {
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
  }, [teacherId]);

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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || "Failed to create behavior");
      }

      const newBehavior = await response.json();
      // Refresh the full behavior list to ensure we have both defaults and customs
      await fetchBehaviors();
      return newBehavior;
    } catch (err) {
      throw err;
    }
  };

  const updateBehavior = async (id: string, name: string) => {
    if (!teacherId) throw new Error("No teacher ID");
    
    try {
      const response = await fetch("/api/behaviors", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          teacherId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || "Failed to update behavior");
      }

      const updatedBehavior = await response.json();
      // Refresh the full behavior list to ensure we have both defaults and customs
      await fetchBehaviors();
      return updatedBehavior;
    } catch (err) {
      throw err;
    }
  };

  const deleteBehavior = async (id: string) => {
    try {
      const response = await fetch("/api/behaviors", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          teacherId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || "Failed to delete behavior");
      }

      // Refresh the full behavior list to ensure we have both defaults and customs
      await fetchBehaviors();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchBehaviors();
  }, [fetchBehaviors]);

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