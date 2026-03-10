"use client";

import { useEffect, useMemo, useState } from "react";

interface GroupItem {
  id: string;
  name: string;
  points?: number;
}

interface Props {
  groups: GroupItem[];
  title?: string;
}

type SortOrder = "desc" | "asc";

export default function GroupLeaderboard({ groups, title = "Group Leaderboards" }: Props) {
  const [tick, setTick] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const sorted = useMemo(() => {
    return [...groups]
      .map(g => ({ ...g, points: g.points ?? 0 }))
      .sort((a, b) => (sortOrder === "desc" ? b.points! - a.points! : a.points! - b.points!))
      .slice(0, 10);
  }, [groups, tick, sortOrder]);

  const crowns = ["👑", "🎖️", "🏅"]; 

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-emerald-100 via-cyan-100 to-indigo-100 border-4 border-emerald-300 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦄</span>
          <h3 className="text-xl font-extrabold text-indigo-700 drop-shadow">{title}</h3>
        </div>
        <button
          onClick={() => setSortOrder(o => o === "desc" ? "asc" : "desc")}
          className="px-2 py-1 rounded-lg bg-white/80 hover:bg-white border border-emerald-300 text-sm font-semibold text-indigo-700 transition-all hover:scale-105 flex items-center gap-1"
          title={sortOrder === "desc" ? "Highest to lowest (click for lowest to highest)" : "Lowest to highest (click for highest to lowest)"}
        >
          {sortOrder === "desc" ? "↓ High→Low" : "↑ Low→High"}
        </button>
      </div>
      {sorted.length === 0 ? (
        <div className="text-sm text-gray-600">No group points yet. Award points to see rankings!</div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((g, idx) => (
            <li key={g.id} className={`flex items-center justify-between px-4 py-2 rounded-2xl border ${idx < 3 ? 'bg-white border-emerald-300' : 'bg-white/70 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">{crowns[idx] || (idx + 1)}</span>
                <span className="font-semibold text-gray-800">{g.name}</span>
              </div>
              <div className="text-indigo-700 font-bold">{g.points ?? 0} star{(g.points ?? 0) === 1 ? "" : "s"}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


