"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import GlobalLogoutButton from "@/components/GlobalLogoutButton";
import {
  getTickets,
  subscribeToTickets,
  type Ticket,
} from "@/lib/tickets";

type Props = {
  email: string;
  name: string;
};

function technicianNameFromEmail(email?: string | null) {
  const value = (email ?? "").trim().toLowerCase();
  if (value === "naomi.manurung@grahasurvei.com") return "Naomi Manurung";
  if (value === "fajar.chan@grahasurvei.com") return "Fajar Chan";
  return "";
}

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
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
    case "home":
      return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-7h6v7" /></svg>;
    case "ticket":
      return <svg {...common}><path d="M4 5h16v4a3 3 0 0 0 0 6v4H4v-4a3 3 0 0 0 0-6V5Z" /><path d="M9 9h6M9 12h6M9 15h3" /></svg>;
    case "portal":
      return <svg {...common}><path d="M14 4h6v6M20 4 11 13" /><path d="M18 13v6H5V6h6" /></svg>;
    case "book":
      return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h7" /></svg>;
    case "search":
      return <svg {...common}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>;
    case "bell":
      return <svg {...common}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>;
    case "file":
      return <svg {...common}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case "settings":
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.2 2.1-2 2-2.1-1.2-.1-.1a7.8 7.8 0 0 1-2 .8l-.6 2.3h-2.8l-.6-2.3a7.8 7.8 0 0 1-2-.8l-.1.1-2.1 1.2-2-2 1.2-2.1.1-.1a7.8 7.8 0 0 1-.8-2L2.5 12v-2.8l2.3-.6a7.8 7.8 0 0 1 .8-2l-.1-.1-1.2-2.1 2-2 2.1 1.2.1.1a7.8 7.8 0 0 1 2-.8l.6-2.3h2.8l.6 2.3a7.8 7.8 0 0 1 2 .8l.1-.1 2.1-1.2 2 2-1.2 2.1-.1.1a7.8 7.8 0 0 1 .8 2l2.3.6V12l-2.3.6a7.8 7.8 0 0 1-.8 2Z" transform="translate(0 1) scale(.92)" /></svg>;
    case "check":
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case "chart":
      return <svg {...common}><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 5-7" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    case "headset":
      return <svg {...common}><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="12" width="4" height="7" rx="2" /><rect x="17" y="12" width="4" height="7" rx="2" /><path d="M17 19a5 5 0 0 1-5 3h-1" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
  }
}

function statusStyle(status: string) {
  switch (status) {
    case "Open":
      return "bg-sky-50 text-sky-700 ring-sky-200";
    case "Assigned":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "In Progress":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "Waiting for User":
      return "bg-violet-50 text-violet-700 ring-violet-200";
    case "Resolved":
    case "Closed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

function priorityStyle(priority: string) {
  if (priority === "High") return "bg-rose-50 text-rose-700";
  if (priority === "Medium") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export default function TechnicianDashboard({ email, name }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");

  const safeEmail = (email ?? "").trim();
  const safeName = (name ?? "").trim() || safeEmail || "Teknisi";
  const technicianName = technicianNameFromEmail(safeEmail);
  const firstName = safeName.split(/\s+/)[0] || "Teknisi";
  const initials = safeName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    const refresh = () => {
      setTickets(getTickets());
      setReady(true);
    };
    refresh();
    return subscribeToTickets(refresh);
  }, []);

  const myTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const assigned = String(ticket.assignedTechnician ?? "").trim().toLowerCase();
        return assigned === technicianName.toLowerCase() && technicianName !== "";
      }),
    [tickets, technicianName]
  );

  const active = myTickets.filter(
    (ticket) => !["Resolved", "Closed"].includes(ticket.status)
  ).length;
  const inProgress = myTickets.filter((ticket) => ticket.status === "In Progress").length;
  const completed = myTickets.filter((ticket) => ["Resolved", "Closed"].includes(ticket.status)).length;
  const highPriority = myTickets.filter(
    (ticket) => ticket.priority === "High" && !["Resolved", "Closed"].includes(ticket.status)
  ).length;
  const waiting = myTickets.filter((ticket) => ticket.status === "Waiting for User").length;
  const openAssigned = myTickets.filter((ticket) => ["Open", "Assigned"].includes(ticket.status)).length;

  const visibleTickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...myTickets]
      .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")))
      .filter((ticket) =>
        !term ||
        [ticket.id, ticket.title, ticket.category, ticket.status, ticket.priority]
          .some((value) => String(value ?? "").toLowerCase().includes(term))
      )
      .slice(0, 5);
  }, [myTickets, search]);

  const total = myTickets.length || 1;
  const openPct = (openAssigned / total) * 100;
  const progressPct = (inProgress / total) * 100;
  const waitingPct = (waiting / total) * 100;
  const completePct = (completed / total) * 100;

  const cards = [
    {
      label: "Tugas Saya",
      value: myTickets.length,
      hint: "Total tiket yang ditugaskan",
      icon: "file",
      theme: "blue",
      href: "/technician/tasks",
      spark: "M2 20 L14 14 L25 16 L36 8 L47 11 L58 4",
    },
    {
      label: "Tiket Aktif",
      value: active,
      hint: "Belum selesai",
      icon: "clock",
      theme: "amber",
      href: "/technician/tasks?view=active",
      spark: "M2 20 L14 17 L25 10 L36 14 L47 5 L58 8",
    },
    {
      label: "Sedang Dikerjakan",
      value: inProgress,
      hint: "Status In Progress",
      icon: "settings",
      theme: "violet",
      href: "/technician/tasks?view=progress",
      spark: "M2 18 L14 12 L25 15 L36 7 L47 10 L58 3",
    },
    {
      label: "Tiket Selesai",
      value: completed,
      hint: "Resolved atau Closed",
      icon: "check",
      theme: "emerald",
      href: "/technician/tasks?view=completed",
      spark: "M2 19 L14 14 L25 17 L36 9 L47 11 L58 4",
    },
  ] as const;

  return (
    <main className="min-h-screen bg-[#f3f7fc] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 lg:flex">
        <div className="flex h-[84px] shrink-0 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-lg font-black text-white shadow-lg shadow-blue-950/40">IT</div>
          <div>
            <p className="text-base font-bold tracking-wide">AMTI</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">IT Service Desk</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Menu Teknisi</p>
          <Link href="/technician/dashboard" className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/20">
            <Icon name="home" className="h-[18px] w-[18px]" /> Dashboard
          </Link>
          <Link href="/technician/tasks" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300">
            <Icon name="ticket" className="h-[18px] w-[18px]" /> Tugas Saya
            <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-slate-950">{ready ? active : "—"}</span>
          </Link>
          <div className="mx-2 my-4 border-t border-slate-200 dark:border-slate-700" aria-hidden="true" />
          <div className="mt-2 px-1"><GlobalLogoutButton /></div>
        </nav>

        <div className="relative mx-4 mb-4 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 text-slate-900 dark:border-blue-300/20 dark:from-blue-900 dark:to-slate-950 dark:text-white">
          <div className="absolute -bottom-7 -right-5 h-24 w-24 rounded-full border border-blue-300/40 dark:border-blue-300/20" />
          <div className="relative">
            <Icon name="headset" className="mb-3 h-7 w-7 text-sky-600 dark:text-sky-300" />
            <p className="text-sm font-bold">IT Help Center</p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-blue-100/70">Butuh bantuan? Tim IT siap membantu penanganan tiket Anda.</p>
            <Link href="/technician/tasks" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-white/20 dark:text-white dark:hover:bg-white/10">Lihat tugas <Icon name="arrow" className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-[258px]">
        <header className="sticky top-0 z-20 flex min-h-[84px] flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 md:px-8">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Technician Portal <span className="mx-1.5 text-slate-300">/</span> Dashboard</p>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-2xl">IT Service Desk</h1>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
            <label className="hidden min-w-0 max-w-[390px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-400 shadow-sm focus-within:border-blue-400 focus-within:bg-white md:flex dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-800">
              <Icon name="search" className="h-5 w-5 shrink-0" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari tiket, kategori, atau kata kunci..." className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white" />
              <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900">⌕</span>
            </label>
            <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-700" />
            <ThemeToggle />
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block"><p className="text-sm font-bold text-slate-800 dark:text-white">{safeName}</p><p className="max-w-[210px] truncate text-[11px] text-slate-500 dark:text-slate-400">{safeEmail}</p></div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-extrabold text-white shadow-md shadow-blue-500/20">{initials || "TK"}</div>
            </div>
          </div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-400 md:hidden dark:border-slate-700 dark:bg-slate-800">
            <Icon name="search" className="h-4 w-4" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari tiket..." className="w-full border-0 bg-transparent text-sm outline-none focus:ring-0 dark:text-white" />
          </label>
        </header>

        <div className="mx-auto w-full max-w-[1700px] space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <section className="relative isolate min-h-[225px] overflow-hidden rounded-[26px] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-7 text-white shadow-xl shadow-blue-900/10 md:px-8 lg:px-9">
            {/* Foto berada di atas background section; overlay transparan diletakkan di atas foto. */}
            <div aria-hidden="true" className="absolute inset-0 z-0 bg-[url('/office.jpeg')] bg-cover bg-center opacity-100" />
            <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-r from-blue-800/65 via-blue-700/50 to-indigo-700/35" />
            <div aria-hidden="true" className="absolute -right-12 -top-24 z-10 h-72 w-72 rounded-full border border-white/15" />
            <div aria-hidden="true" className="absolute -right-2 -top-14 z-10 h-56 w-56 rounded-full border border-white/15" />
            <div className="relative z-20 grid min-h-[170px] items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-50"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Workspace Teknisi</div>
                <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl lg:text-[34px]">Selamat datang kembali, {firstName}</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50/90">Pantau tiket yang ditugaskan kepada Anda, periksa prioritas, dan perbarui progres penanganan dengan lebih cepat.</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href="/technician/tasks" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-blue-50"><Icon name="ticket" className="h-4 w-4" /> Buka Tugas Saya <Icon name="arrow" className="h-4 w-4" /></Link>
                </div>
              </div>
              <div className="hidden justify-end lg:flex">
                <div className="w-full max-w-[330px] rounded-2xl border border-white/20 bg-slate-950/30 p-5 shadow-2xl backdrop-blur-md">
                  <p className="text-3xl font-black text-white/80">“</p>
                  <p className="text-sm font-semibold leading-6 text-white">Teknologi yang andal untuk operasional yang lebih baik.</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-white/15 pt-4"><div className="h-8 w-1 rounded-full bg-sky-300" /><div><p className="text-xs font-bold tracking-[0.2em]">AMTI</p><p className="mt-0.5 text-[10px] text-blue-100/70">Asset Monitoring Teknologi Indonesia</p></div></div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {cards.map((card) => {
              const themeClasses = {
                blue: "bg-blue-50 text-blue-600 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/10",
                amber: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/10",
                violet: "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/10",
                emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/10",
              }[card.theme];
              return (
                <Link key={card.label} href={card.href} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${themeClasses}`}><Icon name={card.icon} className="h-6 w-6" /></div>
                    <span className="mt-1 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-500"><Icon name="arrow" className="h-4 w-4" /></span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">{card.label}</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{ready ? card.value : "—"}</p>
                    <span
                      className={`mb-1 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${themeClasses}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {card.label === "Tugas Saya"
                        ? "Total tugas"
                        : card.label === "Tiket Aktif"
                          ? "Belum selesai"
                          : card.label === "Sedang Dikerjakan"
                            ? "Dalam proses"
                            : "Tuntas"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.hint}</p>
                </Link>
              );
            })}
          </section>

          <section className="grid gap-5 2xl:grid-cols-[1.55fr_1fr]">
            <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800 md:px-6">
                <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><Icon name="file" className="h-5 w-5" /></div><div><h3 className="font-extrabold text-slate-900 dark:text-white">Tiket Terbaru</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Tiket yang ditugaskan kepada Anda</p></div></div>
                <Link href="/technician/tasks" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-300">Lihat semua tiket <Icon name="arrow" className="h-4 w-4" /></Link>
              </div>
              <div className="hidden grid-cols-[1fr_1.5fr_1fr_1fr] gap-3 bg-slate-50/80 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-950/50 dark:text-slate-400 md:grid"><span>No. Tiket</span><span>Judul / Kategori</span><span>Status</span><span>Prioritas</span></div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleTickets.map((ticket) => (
                  <Link key={ticket.id} href="/technician/tasks" className="grid gap-3 px-5 py-4 transition hover:bg-blue-50/50 dark:hover:bg-slate-800/60 md:grid-cols-[1fr_1.5fr_1fr_1fr] md:items-center md:gap-3 md:px-6">
                    <div><p className="text-xs font-extrabold text-blue-600 dark:text-blue-300">{ticket.id}</p><p className="mt-1 text-[10px] text-slate-400">{ticket.date}</p></div>
                    <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{ticket.title}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ticket.category}</p></div>
                    <div><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusStyle(ticket.status)}`}>{ticket.status}</span></div>
                    <div><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${priorityStyle(ticket.priority)}`}>{ticket.priority}</span></div>
                  </Link>
                ))}
                {ready && visibleTickets.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800"><Icon name="ticket" /></div>
                    <p className="mt-3 font-bold text-slate-800 dark:text-white">{search ? "Tiket tidak ditemukan" : "Belum ada tugas untuk Anda"}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{search ? "Coba kata kunci lain." : "Tiket akan tampil setelah Admin menetapkan Anda sebagai teknisi."}</p>
                  </div>
                )}
              </div>
            </article>

            <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-1">
              <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
                <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300"><Icon name="chart" /></div><div><h3 className="font-extrabold text-slate-900 dark:text-white">Distribusi Tugas</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Berdasarkan status tiket</p></div></div>
                <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row 2xl:flex-row">
                  <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#0ea5e9 0 ${openPct}%, #8b5cf6 ${openPct}% ${openPct + progressPct}%, #f59e0b ${openPct + progressPct}% ${openPct + progressPct + waitingPct}%, #10b981 ${openPct + progressPct + waitingPct}% 100%)` }}>
                    <div className="flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full bg-white dark:bg-slate-900"><span className="text-3xl font-extrabold text-slate-900 dark:text-white">{myTickets.length}</span><span className="text-[10px] text-slate-500 dark:text-slate-400">Total tiket</span></div>
                  </div>
                  <div className="w-full space-y-3">
                    {[
                      { label: "Open / Assigned", count: openAssigned, color: "bg-sky-500" },
                      { label: "In Progress", count: inProgress, color: "bg-violet-500" },
                      { label: "Waiting for User", count: waiting, color: "bg-amber-400" },
                      { label: "Resolved / Closed", count: completed, color: "bg-emerald-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`} />{item.label}</span><span className="font-extrabold text-slate-800 dark:text-slate-100">{item.count}</span></div>
                    ))}
                  </div>
                </div>
              </article>

              <Link href="/technician/tasks?view=active" className="block rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm transition hover:border-rose-200 hover:shadow-md dark:border-rose-900/50 dark:from-rose-950/30 dark:to-slate-900 md:p-6">
                <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"><Icon name="bell" /></div><div><h3 className="font-extrabold text-rose-800 dark:text-rose-200">Tiket Prioritas Tinggi</h3><p className="mt-0.5 text-xs text-rose-700/70 dark:text-rose-200/70">Perlu perhatian lebih dahulu</p></div></div><Icon name="arrow" className="h-4 w-4 text-rose-500" /></div>
                <div className="mt-5 flex items-end justify-between"><div><p className="text-4xl font-black text-rose-700 dark:text-rose-300">{ready ? highPriority : "—"}</p><p className="mt-1 text-xs text-rose-800/70 dark:text-rose-200/70">Tiket prioritas tinggi yang belum selesai</p></div><span className="rounded-lg bg-white/80 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm dark:bg-slate-900 dark:text-rose-200">Lihat tugas →</span></div>
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300"><Icon name="clock" /></div><div><h3 className="font-extrabold text-slate-900 dark:text-white">Ringkasan Pekerjaan</h3><p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Progres penanganan tiket Anda</p></div></div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Open / Assigned", count: openAssigned, color: "bg-sky-500" },
                { label: "In Progress", count: inProgress, color: "bg-violet-500" },
                { label: "Waiting for User", count: waiting, color: "bg-amber-400" },
                { label: "Selesai", count: completed, color: "bg-emerald-500" },
              ].map((item) => (
                <Link key={item.label} href={`/technician/tasks?view=${item.label === "In Progress" ? "progress" : item.label === "Selesai" ? "completed" : item.label === "Waiting for User" ? "waiting" : "active"}`} className="rounded-xl bg-slate-50 p-4 transition hover:bg-blue-50 dark:bg-slate-950 dark:hover:bg-slate-800">
                  <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.label}</span><span className="text-sm font-extrabold text-slate-900 dark:text-white">{ready ? item.count : "—"}</span></div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${myTickets.length ? (item.count / myTickets.length) * 100 : 0}%` }} /></div>
                </Link>
              ))}
            </div>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-2 pb-3 text-[11px] text-slate-400"><span>© AMTI · IT Service Desk</span><span>Technician Workspace · Local Prototype</span></footer>
        </div>
      </div>
    </main>
  );
}
