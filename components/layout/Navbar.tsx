"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

interface NavbarProps {
  userEmail?: string;
  isAdmin?: boolean;
}

export default function Navbar({ userEmail, isAdmin }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-green-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-xl">⛳</span>
        <span className="font-display text-lg font-semibold tracking-wide">Golf Charity</span>
      </div>
      <div className="flex items-center gap-4">
        {userEmail ? (
          <>
            <span className="text-sm text-green-200 hidden sm:block">{userEmail}</span>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm px-3 py-1.5 rounded-md hover:bg-green-700 transition"
                style={{ backgroundColor: "#c9a84c" }}
              >
                Admin
              </Link>
            )}
            <Link href="/dashboard" className="text-sm text-green-100 hover:text-white transition">
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm bg-white text-green-900 px-3 py-1.5 rounded-md hover:bg-green-100 transition font-medium"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="flex gap-3">
            <Link href="/login" className="text-sm text-green-100 hover:text-white transition">
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-white text-green-900 px-3 py-1.5 rounded-md hover:bg-green-100 transition font-medium"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}