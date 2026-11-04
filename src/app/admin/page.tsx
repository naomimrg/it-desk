
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getTickets,
  saveTickets,
  subscribeToTickets,
  assignTechnician,
  addTicketNote,
  technicians,
  type Ticket,
  type TicketStatus,
} from "@/lib/tickets";
import GlobalLogoutButton from "@/components/GlobalLogoutButton";
import ThemeToggle from "@/components/ThemeToggle";



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
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg>;
    case "plus":
      return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
    case "logout":
      return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></svg>;
    case "arrow":
      return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9" /></svg>;
  }
}

const statuses: TicketStatus[] = [
  "Open",
  "Assigned",
  "In Progress",
  "Waiting for User",
  "Resolved",
  "Closed",
];

const statusColors: Record<TicketStatus, string> = {
  Open: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  Assigned: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  "In Progress": "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
  "Waiting for User": "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
  Closed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
};

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${statusColors[status]}`}
    >
      {status}
    </span>
  );
}

function PriorityLabel({ priority }: { priority: string }) {
  const color =
    priority === "High"
      ? "text-red-600 dark:text-red-400"
      : priority === "Medium"
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";

  return <span className={`font-semibold ${color}`}>{priority}</span>;
}

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("IT Administrator");

  useEffect(() => {
    const refresh = () => {
      const updated = getTickets();
      setTickets(updated);
      setReady(true);

      setSelected((current) => {
        if (!current) return null;
        return updated.find((ticket) => ticket.id === current.id) ?? null;
      });
    };

    refresh();
    return subscribeToTickets(refresh);
  }, []);

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !keyword ||
        ticket.id.toLowerCase().includes(keyword) ||
        ticket.title.toLowerCase().includes(keyword) ||
        ticket.department.toLowerCase().includes(keyword) ||
        ticket.location.toLowerCase().includes(keyword);

      return (
        matchesSearch &&
        (statusFilter === "All" || ticket.status === statusFilter) &&
        (priorityFilter === "All" || ticket.priority === priorityFilter)
      );
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const openCount = tickets.filter((t) => t.status === "Open").length;

  const progressCount = tickets.filter(
    (t) => t.status === "Assigned" || t.status === "In Progress"
  ).length;

  const waitingCount = tickets.filter(
    (t) => t.status === "Waiting for User"
  ).length;

  const completedCount = tickets.filter(
    (t) => t.status === "Resolved" || t.status === "Closed"
  ).length;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function updateStatus(id: string, status: TicketStatus) {
    try {
      const updated = tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, status } : ticket
      );

      saveTickets(updated);
      setTickets(updated);

      const refreshed = updated.find((ticket) => ticket.id === id);
      if (refreshed) setSelected(refreshed);

      showNotice(`Status tiket ${id} berhasil diperbarui.`);
    } catch (error) {
      showNotice(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan status tiket."
      );
    }
  }

  function updateTechnician(ticketId: string, technician: string) {
    try {
      assignTechnician(ticketId, technician);

      const updated = getTickets();
      setTickets(updated);

      const refreshed = updated.find(
        (ticket) => ticket.id === ticketId
      );

      if (refreshed) setSelected(refreshed);

      showNotice("Penetapan teknisi berhasil disimpan.");
    } catch (error) {
      showNotice(
        error instanceof Error
          ? error.message
          : "Gagal menetapkan teknisi."
      );
    }
  }

  function submitNote() {
    if (!selected) return;

    try {
      addTicketNote(selected.id, noteAuthor, noteText);

      const updated = getTickets();
      setTickets(updated);

      const refreshed = updated.find(
        (ticket) => ticket.id === selected.id
      );

      if (refreshed) setSelected(refreshed);

      setNoteText("");
      showNotice("Catatan penanganan berhasil disimpan.");
    } catch (error) {
      showNotice(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan catatan."
      );
    }
  }

  function openTicketDetail(ticket: Ticket) {
    setSelected(ticket);
    setNoteText("");
    setNoteAuthor("IT Administrator");
  }

  function setQuickFilter(status: string) {
    setStatusFilter(status);
    setPriorityFilter("All");
    setSearch("");

    document.getElementById("all-tickets")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 lg:flex">
        <div className="flex h-[84px] shrink-0 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-lg font-black text-white shadow-xl shadow-blue-950/40">
            IT
          </div>
          <div>
            <p className="font-bold">Service Desk</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">IT Support Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Admin Menu
          </p>

          <Link href="/admin" className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"><Icon name="dashboard" /> Dashboard Admin</Link>

          <Link href="/admin/tickets" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-secondary)]"><Icon name="ticket" /> Semua Tiket</Link>

          <button
            onClick={() => setQuickFilter("Open")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm hover:bg-[var(--surface-secondary)]"
          >
            <Icon name="clock" /> Tiket Baru
          </button>

          <button
            onClick={() => setQuickFilter("In Progress")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm hover:bg-[var(--surface-secondary)]"
          >
            <Icon name="settings" /> Sedang Diproses
          </button>

          <button
            onClick={() => setQuickFilter("Resolved")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm hover:bg-[var(--surface-secondary)]"
          >
            <Icon name="check" /> Tiket Selesai
          </button>

          <div className="my-4 border-t border-slate-200 dark:border-slate-700" />

          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Employee Portal
          </p>

          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-secondary)]"><Icon name="user" /> Halaman User</Link>

          <Link href="/submit-ticket" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-secondary)]"><Icon name="plus" /> Buat Tiket</Link>
        </nav>

        
<div className="mx-5 my-4 border-t border-slate-200 dark:border-slate-700" />
        <div className="px-4 pb-4"><GlobalLogoutButton /></div>


        <div className="relative m-3 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 text-slate-900 dark:border-blue-300/20 dark:from-blue-900 dark:to-slate-950 dark:text-white">
          <p className="text-sm font-semibold">Admin Workspace</p>
          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-blue-100/70">
            Kelola tiket dan pantau penanganan permintaan IT.
          </p>
          <span className="mt-3 inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-xs text-amber-400">
            Prototype Lokal
          </span>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-[258px]">
        <header className="relative z-10 flex sticky top-0 z-20 flex min-h-[84px] w-full items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-5 py-4 text-slate-900 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-50 sm:px-8">
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              IT Operations / Administration
            </p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">
              Admin Dashboard
            </h1>
          </div>

         
<div className="flex items-center gap-4">
  <ThemeToggle />

  <div className="text-right">
    <p className="text-sm font-semibold">IT Administrator</p>
    <p className="text-xs text-slate-500 dark:text-slate-300">Service Desk Team</p>
  </div>

  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
    IT
  </div>
</div>

        </header>

        <div className="mx-auto w-full max-w-[1700px] space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <section className="relative isolate min-h-[225px] overflow-hidden rounded-[26px] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-7 text-white shadow-xl shadow-blue-900/10 md:px-8 lg:px-9">
            <div aria-hidden="true" className="absolute inset-0 z-0 bg-[url('/amti-office-interior.jpg')] bg-cover bg-center" />
            <div aria-hidden="true" className="absolute inset-0 z-10 bg-gradient-to-r from-blue-800/65 via-blue-700/50 to-indigo-700/35" />
            <div aria-hidden="true" className="absolute -right-12 -top-24 z-10 h-72 w-72 rounded-full border border-white/15" />
            <div aria-hidden="true" className="absolute -right-2 -top-14 z-10 h-56 w-56 rounded-full border border-white/15" />
            <p className="relative z-20 mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-50"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> IT Support Overview</p>

            <div className="relative z-20 mt-1 flex min-h-[170px] flex-col justify-between gap-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl lg:text-[34px]">
                  Selamat datang, Admin!
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50/90">
                  Pantau seluruh permintaan IT, prioritaskan kendala, dan
                  perbarui status penanganan dari satu tempat.
                </p>
                <Link
                href="/admin/tickets"
                className="inline-flex w-fit items-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-800 shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                Kelola Semua Tiket →
                </Link>
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

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Tiket",
                value: tickets.length,
                description: "Semua laporan masuk",
                icon: "ticket",
                color: "text-blue-400",
                href: "/admin/tickets",
              },
              {
                label: "Tiket Baru",
                value: openCount,
                description: "Menunggu penanganan",
                icon: "clock",
                color: "text-amber-600 dark:text-amber-400",
                href: "/admin/new",
              },
              {
                label: "Sedang Diproses",
                value: progressCount,
                description: "Assigned dan In Progress",
                icon: "settings",
                color: "text-violet-400",
                href: "/admin/in-progress",
              },
              {
                label: "Tiket Selesai",
                value: completedCount,
                description: "Resolved dan Closed",
                icon: "check",
                color: "text-emerald-600 dark:text-emerald-400",
                href: "/admin/resolved",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-label={`Buka halaman ${item.label}`}
                className="group block min-h-[190px] rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-950/5 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-current/10 bg-[var(--surface-secondary)] ${item.color}`} aria-hidden="true">
                    <Icon name={item.icon} className="h-6 w-6" />
                  </span>
                  <span className="mt-1 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-500" aria-hidden="true">→</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-[var(--muted)]">{item.label}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-3xl font-extrabold tracking-tight">{item.value}</p>
                  <span className={`mb-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-current/15 bg-[var(--surface-secondary)] px-2.5 py-1 text-[10px] font-bold ${item.color}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {item.label === "Total Tiket" ? "Semua tiket" : item.label === "Tiket Baru" ? "Perlu ditangani" : item.label === "Sedang Diproses" ? "Dalam proses" : "Tuntas"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">{item.description}</p>
              </Link>
            ))}
          </section>

          <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold">Ringkasan Operasional</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Tiket yang menunggu respons pengguna: {waitingCount}
              </p>
            </div>

            <button
              onClick={() => {
                setStatusFilter("All");
                setPriorityFilter("All");
                setSearch("");
              }}
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm hover:bg-[var(--surface-secondary)]"
            >
              Reset Filter
            </button>
          </section>

          <section
            id="all-tickets"
            className="scroll-mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-5 xl:flex-row xl:items-center">
              <div>
                <h2 className="text-xl font-bold">Ringkasan Tiket</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {filteredTickets.length} tiket ditemukan
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari ID, judul, departemen..."
                  className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-2.5 text-sm text-[var(--input-foreground)] outline-none focus:border-blue-500"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm text-[var(--input-foreground)]"
                >
                  <option value="All">Semua Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm text-[var(--input-foreground)]"
                >
                  <option value="All">Semua Prioritas</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[var(--surface-secondary)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-4">ID / Judul</th>
                    <th className="px-5 py-4">Departemen</th>
                    <th className="px-5 py-4">Kategori</th>
                    <th className="px-5 py-4">Prioritas</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Tanggal</th>
                    <th className="px-5 py-4">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--border)]">
                  {ready &&
                    filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-[var(--surface-secondary)]"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold">{ticket.id}</p>
                          <p className="mt-1 max-w-64 truncate text-[var(--muted)]">
                            {ticket.title}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p>{ticket.department}</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {ticket.location}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p>{ticket.category}</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {ticket.subcategory}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <PriorityLabel priority={ticket.priority} />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={ticket.status} />
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-[var(--muted)]">
                          {ticket.date}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => openTicketDetail(ticket)}
                            className="rounded-lg border border-[var(--border)] px-3 py-2 hover:border-blue-500 hover:text-blue-400"
                          >
                            Detail →
                          </button>
                        </td>
                      </tr>
                    ))}

                  {ready && filteredTickets.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-[var(--muted)]"
                      >
                        Tidak ada tiket yang sesuai filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[var(--border)] px-5 py-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Menampilkan {filteredTickets.length} dari {tickets.length} tiket
            </div>
          </section>

          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Data prototipe lokal. Belum menggunakan autentikasi admin atau
            database server.
          </p>
        </div>
      </main>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--border)] p-6">
              <div>
                <p className="text-sm text-[var(--muted)]">{selected.id}</p>
                <h2 className="mt-2 text-xl font-bold">{selected.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {selected.department} · {selected.location}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                aria-label="Tutup detail tiket"
                className="rounded-lg px-3 py-1 text-2xl hover:bg-[var(--surface-secondary)]"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ["Kategori", selected.category],
                  ["Subkategori", selected.subcategory],
                  ["Prioritas", selected.priority],
                  ["Dampak", selected.impact],
                  ["Tanggal", selected.date],
                  ["Lampiran", selected.attachmentName || "Tidak ada"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-[var(--surface-secondary)] p-4"
                  >
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-2 break-words font-medium">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold">
                  Deskripsi Masalah
                </h3>
                <div className="min-h-20 whitespace-pre-wrap rounded-xl border border-[var(--border)] p-4 text-sm leading-6">
                  {selected.description || "Tidak ada deskripsi."}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Teknisi Penanggung Jawab
                </h3>

                <p className="mb-2 text-sm text-[var(--muted)]">
                  {selected.assignedTechnician
                    ? `Teknisi saat ini: ${selected.assignedTechnician}`
                    : "Belum ada teknisi yang ditugaskan."}
                </p>

                <select
                  value={selected.assignedTechnician ?? ""}
                  onChange={(e) =>
                    updateTechnician(selected.id, e.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-[var(--input-foreground)]"
                >
                  <option value="">Belum ditugaskan</option>
                  {technicians.map((technician) => (
                    <option key={technician} value={technician}>
                      {technician}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold">Status Tiket</p>
                <StatusBadge status={selected.status} />

                <label
                  htmlFor="admin-status"
                  className="mb-2 mt-5 block text-sm font-semibold"
                >
                  Perbarui status
                </label>

                <select
                  id="admin-status"
                  value={selected.status}
                  onChange={(e) =>
                    updateStatus(
                      selected.id,
                      e.target.value as TicketStatus
                    )
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-[var(--input-foreground)]"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Catatan Penanganan
                </h3>

                <div className="mb-4 space-y-3">
                  {(selected.notes ?? []).length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-sm text-[var(--muted)]">
                      Belum ada catatan penanganan.
                    </p>
                  ) : (
                    (selected.notes ?? []).map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-[var(--border)] p-4"
                      >
                        <div className="flex flex-col justify-between gap-1 sm:flex-row">
                          <p className="text-sm font-semibold">
                            {note.author}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            {note.date}
                          </p>
                        </div>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
                          {note.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <label
                  htmlFor="note-author"
                  className="mb-2 block text-sm font-medium"
                >
                  Nama pencatat
                </label>

                <input
                  id="note-author"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  placeholder="Nama admin atau teknisi"
                  className="mb-3 w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-[var(--input-foreground)]"
                />

                <label
                  htmlFor="note-text"
                  className="mb-2 block text-sm font-medium"
                >
                  Isi catatan
                </label>

                <textarea
                  id="note-text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Tuliskan tindakan yang sudah dilakukan..."
                  rows={4}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-[var(--input-foreground)]"
                />

                <button
                  type="button"
                  onClick={submitNote}
                  disabled={!noteAuthor.trim() || !noteText.trim()}
                  className="mt-3 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Simpan Catatan
                </button>
              </div>

              <div className="flex justify-end border-t border-[var(--border)] pt-4">
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
                >
                  Selesai
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm shadow-xl"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
