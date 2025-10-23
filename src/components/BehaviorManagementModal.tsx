"use client";

import { useEffect, useState } from "react";

interface BehaviorItem {
  id: string;
  name: string;
  praise?: string | null;
}

interface BehaviorManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string | null;
}

export default function BehaviorManagementModal({ isOpen, onClose, teacherId }: BehaviorManagementModalProps) {
  const [behaviors, setBehaviors] = useState<BehaviorItem[]>([]);
  const [name, setName] = useState("");
  const [praise, setPraise] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBehaviors = async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/behaviors?teacherId=${teacherId}&type=GROUP_WORK`);
      if (!res.ok) throw new Error("Failed to load behaviors");
      const data = await res.json();
      setBehaviors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchBehaviors();
  }, [isOpen]);

  const createBehavior = async () => {
    if (!teacherId || !name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/behaviors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), teacherId, behaviorType: 'GROUP_WORK', praise: praise.trim() || null })
      });
      if (!res.ok) throw new Error('Failed to create behavior');
      setName("");
      setPraise("");
      await fetchBehaviors();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateBehavior = async (id: string, updates: Partial<BehaviorItem>) => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/behaviors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, teacherId, name: updates.name, praise: updates.praise })
      });
      if (!res.ok) throw new Error('Failed to update behavior');
      await fetchBehaviors();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteBehavior = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/behaviors', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, teacherId })
      });
      if (!res.ok) throw new Error('Failed to delete behavior');
      await fetchBehaviors();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md">
      <div className="bg-white/95 rounded-2xl shadow-2xl border-4 border-blue-400 w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 text-black">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">MANAGE GROUP BEHAVIORS</h2>
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300">Close</button>
        </div>

        {/* Create */}
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <div className="grid grid-cols-2 gap-3">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Behavior name" className="px-3 py-2 border rounded bg-white text-gray-800 placeholder-gray-400" />
            <input value={praise} onChange={e=>setPraise(e.target.value)} placeholder="Default praise (optional)" className="px-3 py-2 border rounded bg-white text-gray-800 placeholder-gray-400" />
          </div>
          <div className="mt-3">
            <button onClick={createBehavior} disabled={loading || !name.trim()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">Add Behavior</button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {behaviors.map(b => (
            <div key={b.id} className="p-3 border rounded flex items-center gap-3">
              <input defaultValue={b.name} onBlur={e=>updateBehavior(b.id, { name: e.target.value })} className="px-2 py-1 border rounded flex-1 bg-white text-gray-800 placeholder-gray-400" />
              <input defaultValue={b.praise ?? ''} onBlur={e=>updateBehavior(b.id, { praise: e.target.value })} className="px-2 py-1 border rounded flex-1 bg-white text-gray-800 placeholder-gray-400" placeholder="Default praise" />
              <button onClick={()=>deleteBehavior(b.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
            </div>
          ))}
          {behaviors.length === 0 && (
            <div className="text-sm text-gray-500">No behaviors yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}


