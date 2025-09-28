import { useState, useEffect, useCallback } from "react";

interface GroupWork {
  id: string;
  name: string;
  teacherId: string;
  classId?: string;
  createdAt: string;
  updatedAt: string;
  groups: Group[];
  behaviors: GroupWorkBehavior[];
  class?: {
    id: string;
    name: string;
  };
}

interface Group {
  id: string;
  name: string;
  groupWorkId: string;
  createdAt: string;
  updatedAt: string;
  students: GroupStudent[];
}

interface GroupStudent {
  id: string;
  groupId: string;
  studentId: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    classId: string;
  };
}

interface GroupWorkBehavior {
  id: string;
  groupWorkId: string;
  behaviorId: string;
  createdAt: string;
  behavior: {
    id: string;
    name: string;
    teacherId: string;
  };
}

interface CreateGroupWorkData {
  name: string;
  behaviorIds: string[];
  groups: {
    name: string;
    studentIds: string[];
  }[];
  behaviorPraises?: Record<string, string>;
}

export function useGroupWorks(teacherId: string | null) {
  const [groupWorks, setGroupWorks] = useState<GroupWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupWorks = useCallback(async () => {
    if (!teacherId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/group-works?teacherId=${teacherId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch group works");
      }
      
      const data = await response.json();
      setGroupWorks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setGroupWorks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  const createGroupWork = async (data: CreateGroupWorkData & { behaviorNames?: Record<string, string>; behaviorPraises?: Record<string, string> }) => {
    if (!teacherId) throw new Error("No teacher ID");
    
    try {
      const requestData = {
        ...data,
        teacherId,
      };
      
      console.log("Sending data to API:", requestData);
      
      const response = await fetch("/api/group-works", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || "Failed to create group work");
      }

      const newGroupWork = await response.json();
      
      // Add to local state
      setGroupWorks(prev => [newGroupWork, ...prev]);
      
      return newGroupWork;
    } catch (err) {
      throw err;
    }
  };

  const updateGroupWork = async (id: string, data: Partial<CreateGroupWorkData & { behaviorNames?: Record<string, string>; behaviorPraises?: Record<string, string> }>) => {
    if (!teacherId) throw new Error("No teacher ID");
    
    try {
      const response = await fetch(`/api/group-works/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          teacherId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || "Failed to update group work");
      }

      const updatedGroupWork = await response.json();
      
      // Update local state
      setGroupWorks(prev => prev.map(gw => gw.id === id ? updatedGroupWork : gw));
      
      return updatedGroupWork;
    } catch (err) {
      throw err;
    }
  };

  const deleteGroupWork = async (id: string) => {
    if (!teacherId) throw new Error("No teacher ID");
    
    try {
      const response = await fetch(`/api/group-works/${id}?teacherId=${teacherId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || "Failed to delete group work");
      }

      // Remove from local state
      setGroupWorks(prev => prev.filter(gw => gw.id !== id));
      
      return { success: true };
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchGroupWorks();
  }, [fetchGroupWorks]);

  return {
    groupWorks,
    loading,
    error,
    createGroupWork,
    updateGroupWork,
    deleteGroupWork,
    refetch: fetchGroupWorks,
  };
}
