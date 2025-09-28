import { useState, useEffect, useCallback } from "react";

interface GroupPoint {
  id: string;
  groupId: string;
  behaviorId?: string;
  points: number;
  reason: string;
  behaviorName?: string;
  createdAt: string;
  updatedAt: string;
  behavior?: {
    id: string;
    name: string;
    teacherId: string;
  };
  group: {
    id: string;
    name: string;
    groupWorkId: string;
    groupWork: {
      id: string;
      name: string;
      teacherId: string;
    };
  };
}

interface AwardGroupPointsData {
  groupId: string;
  behaviorId: string;
  points: number;
  reason: string;
}

export function useGroupPoints(groupId: string | null) {
  const [groupPoints, setGroupPoints] = useState<GroupPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupPoints = useCallback(async () => {
    if (!groupId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/group-points?groupId=${groupId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch group points");
      }
      const data = await response.json();
      setGroupPoints(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const awardGroupPoints = async (data: AwardGroupPointsData) => {
    try {
      const response = await fetch("/api/group-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || "Failed to award group points");
      }

      const newGroupPoint = await response.json();
      // Refresh the group points list
      await fetchGroupPoints();
      return newGroupPoint;
    } catch (err) {
      throw err;
    }
  };

  const awardMultipleGroupPoints = async (awards: AwardGroupPointsData[]) => {
    try {
      const promises = awards.map(award => awardGroupPoints(award));
      const results = await Promise.all(promises);
      return results;
    } catch (err) {
      throw err;
    }
  };

  const updateGroupPoint = async (id: string, data: Partial<AwardGroupPointsData>) => {
    try {
      const response = await fetch("/api/group-points", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || "Failed to update group points");
      }

      const updatedGroupPoint = await response.json();
      // Refresh the group points list
      await fetchGroupPoints();
      return updatedGroupPoint;
    } catch (err) {
      throw err;
    }
  };

  const deleteGroupPoint = async (id: string) => {
    try {
      const response = await fetch("/api/group-points", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || "Failed to delete group points");
      }

      // Refresh the group points list
      await fetchGroupPoints();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchGroupPoints();
  }, [fetchGroupPoints]);

  return {
    groupPoints,
    loading,
    error,
    awardGroupPoints,
    awardMultipleGroupPoints,
    updateGroupPoint,
    deleteGroupPoint,
    refetch: fetchGroupPoints,
  };
}
