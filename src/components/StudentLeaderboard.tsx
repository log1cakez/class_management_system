"use client";

import { useEffect, useMemo, useState } from "react";

interface Student {
  id: string;
  name: string;
  points?: number;
}

interface Props {
  students: Student[];
  title?: string;
}

type SortOrder = "desc" | "asc";

export default function StudentLeaderboard({ students, title = "Top Stars" }: Props) {
  const [now, setNow] = useState(Date.now());
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(i);
  }, []);

  const sorted = useMemo(() => {
    return [...students]
      .map(s => ({ ...s, points: s.points ?? 0 }))
      .sort((a, b) => (sortOrder === "desc" ? b.points! - a.points! : a.points! - b.points!))
      .slice(0, 10);
  }, [students, now, sortOrder]);

  const medals = ["🥇", "🥈", "🥉"]; // first three

  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 border-4 border-yellow-300 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌟</span>
          <h3 className="text-xl font-extrabold text-purple-700 drop-shadow">{title}</h3>
        </div>
        <button
          onClick={() => setSortOrder(o => o === "desc" ? "asc" : "desc")}
          className="px-2 py-1 rounded-lg bg-white/80 hover:bg-white border border-yellow-300 text-sm font-semibold text-purple-700 transition-all hover:scale-105 flex items-center gap-1"
          title={sortOrder === "desc" ? "Highest to lowest (click for lowest to highest)" : "Lowest to highest (click for highest to lowest)"}
        >
          {sortOrder === "desc" ? "↓ High→Low" : "↑ Low→High"}
        </button>
      </div>
      {sorted.length === 0 ? (
        <div className="text-sm text-gray-600">No points yet. Start awarding to see the leaderboard!</div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((s, idx) => (
            <li key={s.id} className={`flex items-center justify-between px-4 py-2 rounded-2xl border ${idx < 3 ? 'bg-white border-yellow-300' : 'bg-white/70 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">{medals[idx] || (idx + 1)}</span>
                <span className="font-semibold text-gray-800">{s.name}</span>
              </div>
              <div className="text-purple-700 font-bold">{s.points ?? 0} star{(s.points ?? 0) === 1 ? "" : "s"}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


