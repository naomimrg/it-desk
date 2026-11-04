
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import GlobalLogoutButton from "@/components/GlobalLogoutButton";

const menus = [
  { label: "Dashboard", href: "/", icon: "▦" },
  { label: "Submit Tiket", href: "/submit-ticket", icon: "＋" },
  { label: "Tiket Saya", href: "/my-tickets", icon: "▤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white p-5">
      {/* Logo */}
      <Link href="/" className="mb-10 flex shrink-0 items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-xl font-bold text-white">
          IT
        </div>

        <div>
          <p className="font-bold text-slate-900">Service Desk</p>
          <p className="text-xs text-slate-500">Employee Portal</p>
        </div>
      </Link>

      {/* Menu utama */}
      <p className="mb-3 shrink-0 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Menu utama
      </p>

      <nav className="shrink-0 space-y-2">
        {menus.map((menu) => {
          const active = pathname === menu.href;

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-lg" aria-hidden="true">
                {menu.icon}
              </span>
              {menu.label}
            </Link>
          );
        })}

        {/* Tombol logout */}
        <div className="!mt-5 border-t border-slate-200 !pt-4">
          <GlobalLogoutButton />
        </div>
      </nav>

      {/* Informasi bantuan di bawah sidebar */}
      <div className="mt-auto shrink-0 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">
          IT Help Center
        </p>

        <p className="mt-2 text-xs leading-5 text-slate-600">
          Buat tiket untuk meminta bantuan tim IT dan pantau
          perkembangannya.
        </p>

        <p className="mt-3 text-xs font-medium text-amber-700">
          Local Prototype
        </p>
      </div>
    </aside>
  );
}
