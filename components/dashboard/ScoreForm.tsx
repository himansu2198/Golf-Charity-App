"use client";
import { useState } from "react";
import { addScore } from "@/services/scoreService";

interface ScoreFormProps {
  userId: string;
  onScoreAdded: () => void;
}

export default function ScoreForm({ userId, onScoreAdded }: ScoreFormProps) {
  const [score, setScore] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const num = parseInt(score);
    if (isNaN(num) || num < 1 || num > 45) {
      setError("Score must be between 1 and 45.");
      return;
    }
    setLoading(true);
    try {
      await addScore(userId, num);
      setSuccess("Score added successfully!");
      setScore("");
      onScoreAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add score.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="label">Enter Score (1–45)</label>
        <input
          type="number"
          min={1}
          max={45}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="e.g. 18"
          className="input-field w-full max-w-xs"
          required
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-fit disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Score"}
      </button>
      <p className="text-xs text-gray-400">
        Only your last 5 scores are stored. Adding a new one replaces the oldest.
      </p>
    </form>
  );
}