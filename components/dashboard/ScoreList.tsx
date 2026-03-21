import { Score } from "@/types";
import { formatDate } from "@/lib/helpers";

interface ScoreListProps {
  scores: Score[];
}

export default function ScoreList({ scores }: ScoreListProps) {
  if (scores.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">🏌️</p>
        <p className="text-sm">No scores yet. Add your first score above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scores.map((s, index) => (
        <div
          key={s.id}
          className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-3 border border-green-100"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-green-800 text-white text-xs flex items-center justify-center font-bold">
              {index + 1}
            </span>
            <span className="text-2xl font-bold text-green-900 font-display">{s.score}</span>
            <span className="text-xs text-gray-400">pts</span>
          </div>
          <span className="text-xs text-gray-400">{formatDate(s.created_at)}</span>
        </div>
      ))}
      <p className="text-xs text-gray-400 pt-1">
        Showing {scores.length} of max 5 scores (most recent first)
      </p>
    </div>
  );
}