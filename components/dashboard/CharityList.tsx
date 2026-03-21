"use client";

import { useState } from "react";
import { Charity } from "@/types";
import { selectCharity } from "@/services/charityService";

interface CharityListProps {
  charities: Charity[];
  userId: string;
  selectedCharityId?: string;
  onSelect: (charityId: string) => void;
}

export default function CharityList({
  charities,
  userId,
  selectedCharityId,
  onSelect,
}: CharityListProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError]     = useState<string>("");

  const handleSelect = async (charityId: string) => {
    if (charityId === selectedCharityId) return;
    setLoading(charityId);
    setError("");
    try {
      await selectCharity(userId, charityId);
      onSelect(charityId);
    } catch {
      setError("Failed to select charity. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  if (charities.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No charities available.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {charities.map((charity) => {
        const isSelected = charity.id === selectedCharityId;
        const isLoading  = loading === charity.id;

        return (
          <div
            key={charity.id}
            onClick={() => !isSelected && handleSelect(charity.id)}
            className={[
              "w-full",
              "flex items-center justify-between",
              "gap-4",
              "p-4",
              "rounded-xl",
              "border",
              "cursor-pointer",
              "transition-all duration-200",
              isSelected
                ? "bg-green-50 border-green-500"
                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50",
            ].join(" ")}
          >
            {/* Left — icon + text */}
            <div className="flex items-center gap-3 flex-1 min-w-0">

              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm flex-shrink-0">
                💚
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isSelected ? "text-green-800" : "text-gray-800"}`}>
                  {charity.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {charity.description}
                </p>
              </div>
            </div>

            {/* Right — badge */}
            <button
              type="button"
              disabled={isSelected || isLoading}
              onClick={(e) => {
                e.stopPropagation();
                if (!isSelected) handleSelect(charity.id);
              }}
              className={[
                "flex-shrink-0",
                "whitespace-nowrap",
                "text-xs",
                "px-3 py-1",
                "rounded-full",
                "border",
                "font-medium",
                "transition-all duration-200",
                "disabled:cursor-default",
                isSelected
                  ? "bg-green-500 text-white border-green-500"
                  : isLoading
                  ? "border-gray-200 text-gray-300"
                  : "border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600",
              ].join(" ")}
            >
              {isLoading ? "..." : isSelected ? "✓ Selected" : "Select"}
            </button>

          </div>
        );
      })}
    </div>
  );
}