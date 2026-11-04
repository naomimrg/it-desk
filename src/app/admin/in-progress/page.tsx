"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getTickets,
  saveTickets,
  subscribeToTickets,
  type Ticket,
  type TicketStatus,
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
  Open: "border-blue-500/30 bg-blue-500/15 text-blue-400",
  Assigned: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  "In Progress": "border-violet-500/30 bg-violet-500/15 text-violet-400",
  "Waiting for User": "border-orange-500/30 bg-orange-500/15 text-orange-400",
  Resolved: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  Closed: "border-slate-500/30 bg-slate-500/15 text-slate-400",
};

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${statusColors[status]}`}>
      {status}
    </span>
  );
}

function PriorityLabel({ priority }: { priority: string }) {
  const color =
    priority === "High"
      ? "text-red-400"
      : priority === "Medium"
        ? "text-amber-400"
        : "text-emerald-400";

  return <span className={`font-semibold ${color}`}>{priority}</span>;
}

export default function InProgressPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => setTickets(getTickets());
    refresh();
    return subscribeToTickets(refresh);
  }, []);

  const inProgressTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus = ticket.status === "In Progress";
      const matchesPriority =
        priority === "All" || ticket.priority === priority;
      const matchesSearch =
        !keyword ||
        ticket.id.toLowerCase().includes(keyword) ||
        ticket.title.toLowerCase().includes(keyword) ||
        ticket.department.toLowerCase().includes(keyword);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tickets, search, priority]);

  function updateStatus(id: string, status: TicketStatus) {
    const updated = tickets.map((ticket) =>
      ticket.id === id ? { ...ticket, status } : ticket
    );

    try {
      saveTickets(updated);
      setTickets(updated);
      setSelected((current) =>
        current?.id === id ? { ...current, status } : current
      );
      setNotice(`Status tiket ${id} berhasil diperbarui.`);
      window.setTimeout(() => setNotice(""), 3000);
    } catch {
      setNotice("Gagal menyimpan status tiket.");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col border-r border-[var(--border)] bg-[var(--sidebar)] lg:flex">
        <div className="flex h-[84px] items-center gap-3 border-b border-[var(--border)] px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">IT</div>
          <div>
            <p className="font-bold">Service Desk</p>
            <p className="text-xs text-[var(--muted)]">IT Support Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Admin Menu</p>
          <Link href="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-secondary)]"><Icon name="dashboard" /> Dashboard Admin</Link>
          <Link href="/admin/tickets" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-secondary)]"><Icon name="ticket" /> Semua Tiket</Link>
          <Link href="/admin/new" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-secondary)]"><Icon name="clock" /> Tiket Baru</Link>
          <Link href="/admin/in-progress" className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"><Icon name="settings" /> Sedang Diproses</Link>
          <Link href="/admin/resolved" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-secondary)]"><Icon name="check" /> Tiket Selesai</Link>
          <div className="my-4 border-t border-[var(--border)]" />
          <Link href="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-secondary)]"><Icon name="user" /> Halaman User</Link>
          <Link href="/submit-ticket" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors hover:bg-[var(--surface-secondary)]"><Icon name="plus" /> Buat Tiket</Link>
        </nav>

        <div className="m-3 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-4">
          <p className="text-sm font-semibold">Admin Workspace</p>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Pantau dan perbarui progres penanganan tiket IT.</p>
          <span className="mt-3 inline-flex rounded-full bg-amber-500/15 px-2.5 py-1 text-xs text-amber-400">Prototype Lokal</span>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-[258px]">
        <header className="relative z-10 flex min-h-[84px] items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--header)] px-5 py-4 sm:px-8 md:px-8">
          <div>
            <p className="text-xs text-[var(--muted)]">IT Operations / Active Work</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">Sedang Diproses</h1>
          </div>
          <Link href="/admin" className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--surface-secondary)]">← Dashboard</Link>
        </header>

        <div className="mx-auto w-full max-w-[1700px] space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <section className="relative isolate min-h-[190px] overflow-hidden rounded-[26px] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-7 text-white shadow-xl shadow-blue-900/10 md:px-8 lg:px-9">
            <p className="text-sm text-violet-100">Active Work Queue</p>
            <h2 className="mt-2 text-2xl font-bold">Penanganan Tiket Berjalan</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">
              Pantau tiket yang sedang dikerjakan tim IT dan perbarui statusnya ketika ada perkembangan.
            </p>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm text-[var(--muted)]">Sedang Diproses</p>
              <p className="mt-3 text-3xl font-bold">{tickets.filter((t) => t.status === "In Progress").length}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">Status In Progress</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm text-[var(--muted)]">Prioritas Tinggi</p>
              <p className="mt-3 text-3xl font-bold text-red-400">{tickets.filter((t) => t.status === "In Progress" && t.priority === "High").length}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">Perlu perhatian khusus</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-sm text-[var(--muted)]">Menunggu Pengguna</p>
              <p className="mt-3 text-3xl font-bold text-orange-400">{tickets.filter((t) => t.status === "Waiting for User").length}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">Ditampilkan di halaman ini? Tidak, status terpisah.</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-colors">
            <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-5 xl:flex-row xl:items-center">
              <div>
                <h2 className="text-xl font-bold">Antrean Penanganan</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{inProgressTickets.length} tiket ditemukan</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari ID, judul, departemen..." className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-2.5 text-sm text-[var(--input-foreground)] outline-none focus:border-blue-500" />
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm text-[var(--input-foreground)]">
                  <option value="All">Semua Prioritas</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
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
                  {inProgressTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[var(--surface-secondary)]">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{ticket.id}</p>
                        <p className="mt-1 max-w-64 truncate text-[var(--muted)]">{ticket.title}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p>{ticket.department}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{ticket.location}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p>{ticket.category}</p>
                        <p className="mt-1 text-xs text-[var(--muted)]">{ticket.subcategory}</p>
                      </td>
                      <td className="px-5 py-4"><PriorityLabel priority={ticket.priority} /></td>
                      <td className="px-5 py-4"><StatusBadge status={ticket.status} /></td>
                      <td className="whitespace-nowrap px-5 py-4 text-[var(--muted)]">{ticket.date}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => setSelected(ticket)} className="rounded-lg border border-[var(--border)] px-3 py-2 hover:border-blue-500 hover:text-blue-400">Detail →</button>
                      </td>
                    </tr>
                  ))}
                  {inProgressTickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <p className="font-semibold">Tidak ada tiket yang sedang diproses</p>
                        <p className="mt-2 text-sm text-[var(--muted)]">Ubah status tiket dari Open menjadi In Progress untuk menampilkannya di sini.</p>
                        <Link href="/admin/tickets" className="mt-4 inline-block text-sm font-semibold text-blue-400 hover:underline">Lihat semua tiket →</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--border)] p-6">
              <div>
                <p className="text-sm text-[var(--muted)]">{selected.id}</p>
                <h2 className="mt-2 text-xl font-bold">{selected.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{selected.department} · {selected.location}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Tutup detail tiket" className="rounded-lg px-3 py-1 text-2xl hover:bg-[var(--surface-secondary)]">×</button>
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
                  <div key={label} className="rounded-xl bg-[var(--surface-secondary)] p-4">
                    <p className="text-xs text-[var(--muted)]">{label}</p>
                    <p className="mt-2 break-words font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="mb-2 text-sm font-semibold">Deskripsi Masalah</h3>
                <div className="min-h-20 whitespace-pre-wrap rounded-xl border border-[var(--border)] p-4 text-sm leading-6">{selected.description || "Tidak ada deskripsi."}</div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Status Saat Ini</p>
                <StatusBadge status={selected.status} />
                <label htmlFor="progress-status" className="mb-2 mt-5 block text-sm font-semibold">Perbarui Status</label>
                <select id="progress-status" value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value as TicketStatus)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-[var(--input-foreground)]">
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <p className="mt-2 text-xs text-[var(--muted)]">Tiket yang statusnya berubah akan berpindah ke antrean status yang sesuai.</p>
              </div>
              <div className="flex justify-end border-t border-[var(--border)] pt-4">
                <button onClick={() => setSelected(null)} className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700">Selesai</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {notice && (
        <div role="status" className="fixed bottom-5 right-5 z-[60] rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-sm shadow-xl">{notice}</div>
      )}
    </div>
  );
}