import { useState, useEffect, useCallback } from "react";

interface Behavior {
  id: string;
  name: string;
  teacherId: string;
  isDefault?: boolean;
  behaviorType?: 'INDIVIDUAL' | 'GROUP_WORK';
}

export function useBehaviors(teacherId: string | null, behaviorType?: 'INDIVIDUAL' | 'GROUP_WORK') {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingBehavior, setCreatingBehavior] = useState(false);
  const [updatingBehavior, setUpdatingBehavior] = useState(false);
  const [deletingBehavior, setDeletingBehavior] = useState(false);

  const fetchBehaviors = useCallback(async () => {
    if (!teacherId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/behaviors?teacherId=${teacherId}`;
      if (behaviorType) {
        url += `&type=${behaviorType}`;
      }
      
      const response = await fetch(url);
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
  }, [teacherId, behaviorType]);

  const createBehavior = async (name: string) => {
    if (!teacherId) throw new Error("No teacher ID");
    
    setCreatingBehavior(true);
    setError(null);

    try {
      const response = await fetch("/api/behaviors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          teacherId,
          behaviorType: behaviorType || 'INDIVIDUAL',
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
    } finally {
      setCreatingBehavior(false);
    }
  };

  const updateBehavior = async (id: string, name: string) => {
    if (!teacherId) throw new Error("No teacher ID");
    
    setUpdatingBehavior(true);
    setError(null);

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
    } finally {
      setUpdatingBehavior(false);
    }
  };

  const deleteBehavior = async (id: string) => {
    setDeletingBehavior(true);
    setError(null);

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
    } finally {
      setDeletingBehavior(false);
    }
  };

  useEffect(() => {
    fetchBehaviors();
  }, [fetchBehaviors]);

  return {
    behaviors,
    loading,
    error,
    creatingBehavior,
    updatingBehavior,
    deletingBehavior,
    createBehavior,
    updateBehavior,
    deleteBehavior,
    refetch: fetchBehaviors,
  };
}