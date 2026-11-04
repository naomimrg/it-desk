
"use client";

import { signOut } from "next-auth/react";

export default function GlobalLogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="
        w-full rounded-xl px-4 py-3
        text-left text-sm font-semibold
        text-red-600
        transition-colors
        hover:bg-red-100 hover:text-red-800
        dark:text-red-400
        dark:hover:bg-red-500/15 dark:hover:text-red-300
      "
    >
      <span className="mr-2" aria-hidden="true">↪</span>
      Keluar
    </button>
  );
}
