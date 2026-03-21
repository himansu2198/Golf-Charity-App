"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isAdmin?: boolean;
}

const userLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/dashboard#scores", label: "My Scores", icon: "🏌️" },
  { href: "/dashboard#charity", label: "My Charity", icon: "💚" },
  { href: "/dashboard#winnings", label: "Winnings", icon: "🏆" },
];

const adminLinks = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin#users", label: "Users", icon: "👥" },
  { href: "/admin#draw", label: "Run Draw", icon: "🎲" },
  { href: "/admin#winners", label: "Winners", icon: "🥇" },
];

export default function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname();
  const links = isAdmin ? adminLinks : userLinks;

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 py-6 px-3 hidden md:block">
      <ul className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href.split("#")[0];
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-800"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}