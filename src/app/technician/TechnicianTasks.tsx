
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
import GlobalLogoutButton from "@/components/GlobalLogoutButton";
import ThemeToggle from "@/components/ThemeToggle";

type Props = {
  email: string;
  name: string;
};

function Icon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "home": return <svg {...common}><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-7h6v7"/></svg>;
    case "ticket": return <svg {...common}><path d="M4 5h16v4a3 3 0 0 0 0 6v4H4v-4a3 3 0 0 0 0-6V5Z"/><path d="M9 9h6M9 12h6M9 15h3"/></svg>;
    case "search": return <svg {...common}><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>;
    case "file": return <svg {...common}><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>;
    case "check": return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
    case "arrow": return <svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "headset": return <svg {...common}><path d="M4 13v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="12" width="4" height="7" rx="2"/><rect x="17" y="12" width="4" height="7" rx="2"/></svg>;
    default: return <svg {...common}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

const statuses: TicketStatus[] = [
  "Assigned",
  "In Progress",
  "Waiting for User",
  "Resolved",
  "Closed",
];

function technicianNameFromEmail(email: string) {
  const value = email.trim().toLowerCase();

  if (value === "naomi.manurung@grahasurvei.com") {
    return "Naomi Manurung";
  }

  if (value === "fajar.chan@grahasurvei.com") {
    return "Fajar Chan";
  }

  return "";
}

export default function TechnicianTasks({ email, name }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const applyViewFromUrl = () => {
      const view = new URLSearchParams(window.location.search).get("view");
      const allowedViews = ["active", "progress", "completed", "waiting"];
      setFilter(view && allowedViews.includes(view) ? view : "All");
    };

    applyViewFromUrl();
    window.addEventListener("popstate", applyViewFromUrl);
    return () => window.removeEventListener("popstate", applyViewFromUrl);
  }, []);
  const [notice, setNotice] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  const safeEmail = (email ?? "").trim();
  const safeName = (name ?? "").trim() || safeEmail || "Teknisi";
  const initials = safeName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const technicianName = technicianNameFromEmail(safeEmail);

  useEffect(() => {
    const refresh = () => {
      setTickets(getTickets());
      setReady(true);
    };

    refresh();
    return subscribeToTickets(refresh);
  }, []);

  // Tiket yang sudah ditugaskan kepada teknisi yang sedang login.
  const myTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          Boolean(technicianName) &&
          ticket.assignedTechnician.trim().toLowerCase() ===
            technicianName.toLowerCase()
      ),
    [tickets, technicianName]
  );

  // Tiket yang belum ditugaskan dan masih berstatus Open.
  // Teknisi hanya melihatnya, bukan mengambil atau mengklaim tiket.
  const availableTickets = useMemo(
    () =>
      tickets.filter(
        (ticket) =>
          !ticket.assignedTechnician.trim() &&
          ticket.status === "Open"
      ),
    [tickets]
  );

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return myTickets.filter((ticket) => {
      const matchesSearch =
        !keyword ||
        ticket.id.toLowerCase().includes(keyword) ||
        ticket.title.toLowerCase().includes(keyword) ||
        ticket.category.toLowerCase().includes(keyword);

      const matchesStatus =
        filter === "All" ||
        (filter === "active" && !["Resolved", "Closed"].includes(ticket.status)) ||
        (filter === "progress" && ticket.status === "In Progress") ||
        (filter === "completed" && ["Resolved", "Closed"].includes(ticket.status)) ||
        (filter === "waiting" && ticket.status === "Waiting for User") ||
        ticket.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [myTickets, search, filter]);

  function updateStatus(ticketId: string, status: TicketStatus) {
    try {
      const current = getTickets();

      const updated = current.map((ticket) => {
        if (
          ticket.id !== ticketId ||
          !technicianName ||
          ticket.assignedTechnician.trim().toLowerCase() !==
            technicianName.toLowerCase()
        ) {
          return ticket;
        }

        return { ...ticket, status };
      });

      saveTickets(updated);
      setTickets(updated);
      setNotice(`Status tiket ${ticketId} diperbarui.`);
    } catch {
      setNotice("Gagal memperbarui status tiket.");
    }
  }

  function saveNote(ticketId: string) {
    const text = (notes[ticketId] ?? "").trim();

    if (!text) {
      setNotice("Isi catatan terlebih dahulu.");
      return;
    }

    try {
      const current = getTickets();
      let found = false;

      const updated = current.map((ticket) => {
        if (
          ticket.id !== ticketId ||
          !technicianName ||
          ticket.assignedTechnician.trim().toLowerCase() !==
            technicianName.toLowerCase()
        ) {
          return ticket;
        }

        found = true;

        return {
          ...ticket,
          notes: [
            ...(ticket.notes ?? []),
            {
              id: `NOTE-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
              author: name,
              text,
              date: new Date().toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
        };
      });

      if (!found) {
        setNotice("Tiket tidak ditemukan atau bukan tugasmu.");
        return;
      }

      saveTickets(updated);
      setTickets(updated);
      setNotes((currentNotes) => ({
        ...currentNotes,
        [ticketId]: "",
      }));
      setNotice(`Catatan tiket ${ticketId} berhasil disimpan.`);
    } catch {
      setNotice("Gagal menyimpan catatan.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f3f7fc] text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[258px] flex-col border-r border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="flex h-[84px] shrink-0 items-center gap-3 border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 via-blue-600 to-blue-700 text-lg font-black text-white ring-1 ring-blue-300/60 shadow-[0_8px_20px_rgba(37,99,235,0.45)] drop-shadow-md transition-shadow">IT</div>
          <div><p className="text-base font-bold tracking-wide">AMTI</p><p className="text-xs text-slate-500 dark:text-slate-400">IT Service Desk</p></div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Menu Teknisi</p>
          <Link href="/technician/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            <Icon name="home" className="h-[18px] w-[18px]" /> Dashboard
          </Link>
          <Link href="/technician/tasks" className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20">
            <Icon name="ticket" className="h-[18px] w-[18px]" /> Tugas Saya
            <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-slate-950">{ready ? myTickets.length : "—"}</span>
          </Link>
          <div className="my-5 border-t border-slate-200 dark:border-slate-800" />
          <div className="px-1"><GlobalLogoutButton /></div>
        </nav>
        <div className="relative mx-4 mb-4 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4 dark:border-blue-400/20 dark:from-blue-950 dark:to-slate-950">
          <div className="relative"><Icon name="headset" className="mb-3 h-7 w-7 text-sky-500 dark:text-sky-300"/><p className="text-sm font-bold">IT Help Center</p><p className="mt-1 text-xs leading-5 text-slate-600 dark:text-blue-100/70">Butuh bantuan? Tim IT siap membantu penanganan tiket Anda.</p></div>
        </div>
      </aside>

      <div className="min-w-0 lg:pl-[258px]">
        <header className="sticky top-0 z-20 flex min-h-[84px] flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 md:px-8">
          <div><p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Technician Portal <span className="mx-1.5 text-slate-300">/</span> Tugas Saya</p><h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-2xl">IT Service Desk</h1></div>
          <div className="flex flex-1 items-center justify-end gap-3 md:gap-4">
            <label className="hidden min-w-0 max-w-[390px] flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-400 shadow-sm focus-within:border-blue-400 focus-within:bg-white md:flex dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-800">
              <Icon name="search" className="h-5 w-5 shrink-0"/><span className="sr-only">Cari tiket</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari tiket, kategori, atau kata kunci..." className="w-full min-w-0 border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 dark:text-white"/><span className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900">⌕</span>
            </label>
            <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-slate-700"/><ThemeToggle />
            <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-bold text-slate-800 dark:text-white">{safeName}</p><p className="max-w-[210px] truncate text-[11px] text-slate-500 dark:text-slate-400">{safeEmail}</p></div><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-extrabold text-white shadow-md shadow-blue-500/20">{initials || "TK"}</div></div>
          </div>
          <label className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-400 md:hidden dark:border-slate-700 dark:bg-slate-800"><Icon name="search" className="h-4 w-4"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari tiket..." className="w-full border-0 bg-transparent text-sm outline-none focus:ring-0 dark:text-white"/></label>
        </header>

        <div className="mx-auto w-full max-w-[1700px] space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {notice && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded-xl border border-blue-400/20 bg-blue-400/10 px-4 py-3 text-sm text-blue-200"
            >
              <span>{notice}</span>
              <button
                onClick={() => setNotice("")}
                aria-label="Tutup pemberitahuan"
              >
                ✕
              </button>
            </div>
          )}

          {!technicianName && (
            <section className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
              Email ini belum dipetakan ke nama teknisi. Periksa konfigurasi
              email teknisi di TechnicianTasks.tsx.
            </section>
          )}

          {/* BAGIAN TUGAS SAYA */}
          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold">Tugas Saya</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Tiket yang ditugaskan Admin kepada {name}.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {myTickets.length} tiket
                </span>
              </div>
            </div>

            <section className="grid gap-3 md:grid-cols-[1fr_220px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nomor tiket, judul, atau kategori..."
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">Semua status</option>
                <option value="active">Tiket aktif</option>
                <option value="progress">Sedang dikerjakan</option>
                <option value="completed">Tiket selesai</option>
                <option value="waiting">Menunggu pengguna</option>
                <optgroup label="Status individual">
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </optgroup>
              </select>
            </section>

            {!ready ? (
              <p className="p-8 text-center text-slate-500 dark:text-slate-400">
                Memuat tiket...
              </p>
            ) : filteredTickets.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="text-3xl text-slate-500 dark:text-slate-400">▤</div>
                <h3 className="mt-4 font-semibold">
                  Belum ada tugas yang sesuai
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Tiket yang sudah ditugaskan kepadamu akan muncul di bagian
                  ini. Jika seharusnya sudah ada, minta Admin memeriksa
                  penugasan teknisi pada tiket.
                </p>
              </section>
            ) : (
              <section className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors md:p-6 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                            {ticket.id}
                          </span>

                          <span className="rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 px-3 py-1 text-xs">
                            {ticket.status}
                          </span>

                          <span
                            className={`text-xs font-bold ${
                              ticket.priority === "High"
                                ? "text-red-600 dark:text-red-300"
                                : ticket.priority === "Medium"
                                  ? "text-amber-600 dark:text-amber-300"
                                  : "text-emerald-600 dark:text-emerald-300"
                            }`}
                          >
                            {ticket.priority} Priority
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-semibold">
                          {ticket.title}
                        </h3>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {ticket.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            {ticket.category} · {ticket.subcategory}
                          </span>
                          <span>{ticket.department}</span>
                          <span>{ticket.location}</span>
                          <span>{ticket.date}</span>
                        </div>

                        {ticket.attachmentName && (
                          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                            Lampiran: {ticket.attachmentName}
                          </p>
                        )}
                      </div>

                      <div className="w-full shrink-0 lg:w-56">
                        <label
                          htmlFor={`status-${ticket.id}`}
                          className="mb-2 block text-xs font-medium text-slate-500 dark:text-slate-400"
                        >
                          Perbarui status
                        </label>

                        <select
                          id={`status-${ticket.id}`}
                          value={ticket.status}
                          onChange={(event) =>
                            updateStatus(
                              ticket.id,
                              event.target.value as TicketStatus
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 px-3 py-3 text-sm outline-none focus:border-blue-500"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => updateStatus(ticket.id, "Resolved")}
                          disabled={["Resolved", "Closed"].includes(ticket.status)}
                          className={`mt-3 w-full rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                            ["Resolved", "Closed"].includes(ticket.status)
                              ? "cursor-not-allowed border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                              : "bg-emerald-600 text-white hover:bg-emerald-500"
                          }`}
                        >
                          {["Resolved", "Closed"].includes(ticket.status)
                            ? "✓ Sudah Ditandai Selesai"
                            : "✓ Tandai Selesai"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-4">
                      <label
                        htmlFor={`note-${ticket.id}`}
                        className="mb-2 block text-sm font-semibold"
                      >
                        Catatan penanganan
                      </label>

                      {(ticket.notes ?? []).length > 0 && (
                        <div className="mb-4 space-y-3">
                          {ticket.notes.map((note) => (
                            <div
                              key={note.id}
                              className="rounded-lg border border-slate-200 dark:border-slate-800 p-3"
                            >
                              <div className="flex flex-wrap justify-between gap-2 text-xs">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {note.author}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400">
                                  {note.date}
                                </span>
                              </div>

                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                                {note.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <textarea
                        id={`note-${ticket.id}`}
                        value={notes[ticket.id] ?? ""}
                        onChange={(event) =>
                          setNotes((current) => ({
                            ...current,
                            [ticket.id]: event.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Tuliskan langkah pemeriksaan atau hasil penanganan..."
                        className="w-full rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-3 py-3 text-sm outline-none placeholder:text-slate-500 dark:text-slate-400 focus:border-blue-500"
                      />

                      <button
                        onClick={() => saveNote(ticket.id)}
                        className="mt-3 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
                      >
                        Simpan Catatan
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </section>

          {/* BAGIAN TIKET TERSEDIA */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Tiket Tersedia</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Tiket yang belum ditugaskan dan menunggu keputusan Admin.
                </p>
              </div>

              <span className="rounded-full border border-amber-400/20 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                {availableTickets.length} tiket
              </span>
            </div>

            {!ready ? (
              <p className="p-8 text-center text-slate-500 dark:text-slate-400">
                Memuat tiket tersedia...
              </p>
            ) : availableTickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p className="font-semibold">
                  Tidak ada tiket yang menunggu penugasan
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Tiket baru yang belum ditugaskan akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {availableTickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                        {ticket.id}
                      </span>

                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                        Menunggu Admin
                      </span>
                    </div>

                    <h3 className="mt-3 font-semibold">{ticket.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {ticket.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{ticket.category}</span>
                      <span>· {ticket.department}</span>
                      <span>· {ticket.location}</span>
                      <span>· {ticket.priority} Priority</span>
                    </div>

                    <p className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Penugasan dilakukan oleh Admin. Kamu belum ditetapkan
                      sebagai penanggung jawab tiket ini.
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
