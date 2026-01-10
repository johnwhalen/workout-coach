"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

/**
 * Chat page header with branding and navigation
 */
export function ChatHeader() {
  return (
    <div className="flex items-center mb-6">
      <h1 className="text-2xl font-bold text-gold">Golden Harbor</h1>
      <div className="ml-auto flex items-center gap-3">
        <Link
          className="px-4 py-2 bg-gold hover:bg-gold/90 text-navy-900 rounded-lg transition font-medium"
          href="/metrics"
        >
          Dashboard
        </Link>
        <UserButton />
      </div>
    </div>
  );
}
