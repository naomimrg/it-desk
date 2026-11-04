"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import {
  getTickets,
  statusClass,
  subscribeToTickets,
  type Ticket,
} from "@/lib/tickets";

function Icon({ name, className = "h-[18px] w-[18px]" }: { name: string; className?: string }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "dashboard":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    case "ticket":
      return <svg {...common}><path d="M4 5h16v4a3 3 0 0 0 0 6v4H4v-4a3 3 0 0 0 0-6V5Z" /><path d="M9 9h6M9 12h6M9 15h3" /></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "settings":
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.8Z" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "chart":
      return <svg {...common}><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-7" /></svg>;
    case "alert":
      return <svg {...common}><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3l-7.6-13.1a2 2 0 0 0-3.4 0Z" /></svg>;
    case "file":
      return <svg {...common}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>;
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
  }
}

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const refreshTickets = () => {
      setTickets(getTickets());
      setLoaded(true);
    };

    refreshTickets();
    return subscribeToTickets(refreshTickets);
  }, []);

  const active = tickets.filter(
    (ticket) => !["Resolved", "Closed"].includes(ticket.status)
  ).length;

  const progress = tickets.filter(
    (ticket) =>
      ticket.status === "In Progress" || ticket.status === "Assigned"
  ).length;

  const completed = tickets.filter((ticket) =>
    ["Resolved", "Closed"].includes(ticket.status)
  ).length;

  const highPriority = tickets.filter(
    (ticket) =>
      ticket.priority === "High" &&
      !["Resolved", "Closed"].includes(ticket.status)
  ).length;

  const statusSummary = useMemo(
    () => [
      {
        label: "Open / Assigned",
        count: tickets.filter((ticket) =>
          ["Open", "Assigned"].includes(ticket.status)
        ).length,
        color: "bg-blue-500",
      },
      {
        label: "In Progress",
        count: tickets.filter((ticket) => ticket.status === "In Progress")
          .length,
        color: "bg-violet-500",
      },
      {
        label: "Waiting for User",
        count: tickets.filter((ticket) => ticket.status === "Waiting for User")
          .length,
        color: "bg-amber-500",
      },
      {
        label: "Selesai",
        count: completed,
        color: "bg-emerald-500",
      },
    ],
    [tickets, completed]
  );

  const cards = [
    {
      label: "Total tiket",
      value: tickets.length,
      icon: "ticket",
      tone: "blue",
      description: "Semua laporan masuk",
      href: "/my-tickets",
    },
    {
      label: "Tiket aktif",
      value: active,
      icon: "clock",
      tone: "cyan",
      description: "Masih membutuhkan tindak lanjut",
      href: "/my-tickets?view=active",
    },
    {
      label: "Sedang diproses",
      value: progress,
      icon: "settings",
      tone: "violet",
      description: "Assigned dan In Progress",
      href: "/my-tickets?view=progress",
    },
    {
      label: "Tiket selesai",
      value: completed,
      icon: "check",
      tone: "emerald",
      description: "Resolved atau Closed",
      href: "/my-tickets?view=completed",
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />

      <main className="min-h-screen min-w-0 lg:ml-[258px]">
        <header className="sticky top-0 z-20 flex min-h-[84px] flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-5 py-4 text-slate-900 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-50 sm:px-8">
          <div>
            <p className="text-xs font-medium tracking-wide text-[var(--muted)]">
              Employee Portal <span className="mx-1 text-blue-500">/</span> Dashboard
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
              IT Service Desk
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Demo User</p>
              <p className="text-xs text-[var(--muted)]">User / Karyawan</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-blue-600/20">
              DU
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1700px] space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {/* Welcome banner */}
          <section className="relative isolate min-h-[225px] overflow-hidden rounded-[26px] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-7 text-white shadow-xl shadow-blue-900/10 md:px-8 lg:px-9">
            <div aria-hidden="true" className="absolute inset-0 z-0 bg-[url('/office.jpeg')] bg-cover bg-center" />
            <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-r from-blue-800/65 via-blue-700/50 to-indigo-700/35" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-24 z-10 h-72 w-72 rounded-full border border-white/15" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-14 z-10 h-56 w-56 rounded-full border border-white/15" />

            <div className="relative z-20 flex min-h-[170px] flex-col justify-between gap-7 md:flex-row md:items-center">
              <div className="relative z-20 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-50 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.12)]" />
                  Portal dukungan internal AMTI
                </div>
                <p className="mt-4 text-sm font-medium text-blue-100">
                  Selamat datang di IT Service Desk
                </p>
                <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight md:text-3xl lg:text-[34px]">
                  Ada yang bisa kami bantu?
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50/90 sm:text-base">
                  Ajukan permintaan IT, ikuti perkembangan tiket, dan tetap
                  terhubung dengan tim support dari satu tempat.
                </p>
              </div>

              <Link
                href="/submit-ticket"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/30"
              >
                <Icon name="plus" className="h-4 w-4" />
                Submit Tiket
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Statistics */}
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Ringkasan tiket</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Gambaran terbaru permintaan IT kamu.
                </p>
              </div>
              <span className="text-xs text-[var(--muted)]">
                {loaded ? `${tickets.length} tiket tercatat` : "Memuat data…"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  aria-label={`Buka halaman ${card.label}`}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 ${
                    card.tone === "blue" ? "bg-blue-500" :
                    card.tone === "cyan" ? "bg-cyan-500" :
                    card.tone === "violet" ? "bg-violet-500" : "bg-emerald-500"
                  }`} />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--muted)]">
                        {card.label}
                      </p>
                      <p className="mt-4 text-4xl font-bold tracking-tight">
                        {loaded ? card.value : "—"}
                      </p>
                    </div>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset ${
                      card.tone === "blue" ? "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/10" :
                      card.tone === "cyan" ? "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/10" :
                      card.tone === "violet" ? "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/10" :
                      "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/10"
                    }`}>
                      <Icon name={card.icon} className="h-6 w-6" />
                    </span>
                  </div>
                  <p className="mt-3 min-h-8 text-xs leading-5 text-[var(--muted)]">
                    {card.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs font-semibold text-blue-500">
                    <span>Lihat detail</span>
                    <span className="transition-transform group-hover:translate-x-1"><Icon name="arrow" className="h-4 w-4" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Work overview and attention */}
          <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold">Status penanganan</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Distribusi tiket berdasarkan status saat ini.
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  <Icon name="chart" className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {statusSummary.map((item) => {
                  const percent = tickets.length
                    ? Math.round((item.count / tickets.length) * 100)
                    : 0;

                  return (
                    <div key={item.label}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs font-semibold text-[var(--muted)]">
                          {loaded ? item.count : "—"}{" "}
                          <span className="font-normal">({percent}%)</span>
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-secondary)]">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-rose-500/10 blur-2xl" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold">Perlu perhatian</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Tiket prioritas tinggi yang belum selesai.
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                    <Icon name="alert" className="h-5 w-5" />
                  </span>
                </div>

                <div className="mt-7 flex items-end gap-3">
                  <p className="text-5xl font-bold tracking-tight">{loaded ? highPriority : "—"}</p>
                  <span className="mb-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-500">
                    Prioritas tinggi
                  </span>
                </div>

                <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
                  {highPriority > 0
                    ? "Ada tiket prioritas tinggi yang masih membutuhkan tindak lanjut."
                    : "Tidak ada tiket prioritas tinggi yang belum selesai. Terima kasih sudah memantau tiketmu."}
                </p>

                <Link
                  href="/my-tickets"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold transition hover:border-blue-400 hover:text-blue-500"
                >
                  Lihat tiket saya <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* Recent tickets */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold">Tiket terbaru</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Ringkasan permintaan IT yang terakhir masuk.
                </p>
              </div>
              <Link
                href="/my-tickets"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-blue-500 transition hover:bg-blue-500/10"
              >
                Lihat semua tiket <Icon name="arrow" className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {tickets.slice(0, 5).map((ticket) => (
                <TicketRow key={ticket.id} ticket={ticket} />
              ))}

              {loaded && tickets.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    <Icon name="ticket" className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-semibold">Belum ada tiket</h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Buat tiket pertama untuk meminta bantuan IT.
                  </p>
                  <Link
                    href="/submit-ticket"
                    className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    Buat tiket pertama
                  </Link>
                </div>
              )}
            </div>

            {tickets.length > 5 && (
              <div className="border-t border-[var(--border)] bg-[var(--surface-secondary)]/60 p-4 text-center">
                <Link
                  href="/my-tickets"
                  className="text-sm font-semibold text-blue-500 hover:underline"
                >
                  Lihat semua {tickets.length} tiket
                </Link>
              </div>
            )}
          </section>

          <footer className="pb-5 text-center text-xs text-[var(--muted)]">
            IT Service Desk · AMTI <span className="mx-1">•</span> Local Prototype
          </footer>
        </div>
      </main>
    </div>
  );
}

function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link
      href="/my-tickets"
      className="group flex flex-col justify-between gap-4 p-5 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:hover:bg-slate-800/60 sm:flex-row sm:items-center sm:px-6"
      aria-label={`Lihat tiket ${ticket.id}: ${ticket.title}`}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300 sm:flex">
          <Icon name="ticket" className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold text-blue-500">{ticket.id}</p>
            <span className="text-[var(--muted)]">·</span>
            <p className="text-xs text-[var(--muted)]">{ticket.category}</p>
          </div>
          <p className="mt-1 break-words font-semibold transition group-hover:text-blue-500">
            {ticket.title}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">{ticket.date}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 pl-0 sm:pl-4">
        <span className="text-xs text-[var(--muted)]">{ticket.priority}</span>
        <span
          className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(ticket.status)}`}
        >
          {ticket.status}
        </span>
        <span aria-hidden="true" className="ml-1 text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-blue-500">
          <Icon name="arrow" className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
