interface SubscriptionCardProps {
  status?: string | null;
}

interface StatusStyle {
  bg: string;
  border: string;
  text: string;
  dot: string;
  label: string;
  description: string;
}

// ── All possible statuses mapped to styles and labels ──
const statusMap: Record<string, StatusStyle> = {
  active: {
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    text: "text-green-400",
    dot: "bg-green-400",
    label: "Active",
    description: "Full access to all features and draws",
  },
  trial: {
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
    label: "Trial",
    description: "Limited access — trial period active",
  },
  expired: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
    dot: "bg-red-400",
    label: "Expired",
    description: "Subscription expired — renew to participate",
  },
  inactive: {
    bg: "bg-gray-500/10",
    border: "border-gray-500/20",
    text: "text-gray-400",
    dot: "bg-gray-400",
    label: "Inactive",
    description: "Account inactive — contact support",
  },
};

// Fallback for unknown statuses
const fallbackStyle: StatusStyle = {
  bg: "bg-gray-500/10",
  border: "border-gray-500/20",
  text: "text-gray-400",
  dot: "bg-gray-400",
  label: "Unknown",
  description: "Status unavailable",
};

export default function SubscriptionCard({ status }: SubscriptionCardProps) {
  // Normalize — trim, lowercase, fallback to "trial" if null/undefined/empty
  const normalized = status?.trim().toLowerCase() || "trial";
  const style = statusMap[normalized] ?? fallbackStyle;

  return (
    <div
      className={`
        flex items-center justify-between gap-4
        px-4 py-3 rounded-xl border
        ${style.bg} ${style.border}
        transition-colors duration-200
      `}
    >
      <div className="flex items-center gap-3">
        {/* Pulsing status dot */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span
            className={`
              animate-ping absolute inline-flex h-full w-full
              rounded-full opacity-60 ${style.dot}
            `}
          />
          <span
            className={`
              relative inline-flex rounded-full h-2.5 w-2.5 ${style.dot}
            `}
          />
        </span>

        <div>
          <p className={`text-xs font-semibold ${style.text}`}>
            {style.label}
          </p>
          <p className="text-xs text-white/25 mt-0.5 hidden sm:block">
            {style.description}
          </p>
        </div>
      </div>

      {/* Badge */}
      <span
        className={`
          shrink-0 text-xs font-bold px-2.5 py-1
          rounded-full border ${style.bg} ${style.border} ${style.text}
        `}
      >
        {style.label}
      </span>
    </div>
  );
}