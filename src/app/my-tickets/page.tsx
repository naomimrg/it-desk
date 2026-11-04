"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import {
  getTickets,
  statusClass,
  subscribeToTickets,
  type Ticket,
} from "@/lib/tickets";

const statuses = [
  "All",
  "Open",
  "Assigned",
  "In Progress",
  "Waiting for User",
  "Resolved",
  "Closed",
];

type ViewFilter = "All" | "Active" | "Progress" | "Completed";

function readView(value: string | null): ViewFilter {
  if (value === "active" || value === "Active") return "Active";
  if (value === "progress" || value === "Progress") return "Progress";
  if (value === "completed" || value === "Completed") return "Completed";
  return "All";
}

export default function MyTicketsPage() {
  const params = useSearchParams();
  const createdId = params.get("created");
  const requestedView = readView(params.get("view"));

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ViewFilter | string>(requestedView);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFilter(requestedView);
  }, [requestedView]);

  useEffect(() => {
    const refresh = () => {
      setTickets(getTickets());
      setLoaded(true);
    };

    refresh();
    return subscribeToTickets(refresh);
  }, []);

  const createdTicket = tickets.find((ticket) => ticket.id === createdId);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const text =
        `${ticket.id} ${ticket.title} ${ticket.category}`.toLowerCase();
      const matchesSearch = text.includes(keyword);

      let matchesFilter = true;

      if (filter === "Active") {
        matchesFilter = !["Resolved", "Closed"].includes(ticket.status);
      } else if (filter === "Progress") {
        matchesFilter = ["Assigned", "In Progress"].includes(ticket.status);
      } else if (filter === "Completed") {
        matchesFilter = ["Resolved", "Closed"].includes(ticket.status);
      } else if (filter !== "All") {
        matchesFilter = ticket.status === filter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [tickets, search, filter]);

  const filterLabel =
    filter === "Active"
      ? "Tiket Aktif"
      : filter === "Progress"
        ? "Sedang Diproses"
        : filter === "Completed"
          ? "Tiket Selesai"
          : filter === "All"
            ? "Semua Tiket"
            : `Status: ${filter}`;

  function changeFilter(value: string) {
    setFilter(value);
    const url = new URL(window.location.href);

    if (["Active", "Progress", "Completed"].includes(value)) {
      url.searchParams.set(
        "view",
        value === "Active"
          ? "active"
          : value === "Progress"
            ? "progress"
            : "completed"
      );
    } else {
      url.searchParams.delete("view");
      if (value !== "All") url.searchParams.set("status", value);
      else url.searchParams.delete("status");
    }

    window.history.replaceState(null, "", url.toString());
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />

      <main className="min-h-screen min-w-0 lg:ml-64">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5 md:px-10">
          <div>
            <p className="text-xs text-[var(--muted)]">
              Employee Portal / Tiket Saya
            </p>
            <h1 className="mt-1 text-xl font-bold text-[var(--foreground)]">
              Tiket Saya
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <div className="mx-auto w-full max-w-[1400px] space-y-6 px-6 py-8 md:px-10 xl:px-12">
          {createdTicket && (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="font-semibold text-emerald-800">
                ✓ Tiket berhasil dibuat!
              </p>
              <p className="mt-2 text-sm text-emerald-800">
                Nomor tiket: <strong>{createdTicket.id}</strong>
              </p>
              <p className="mt-1 text-sm text-emerald-800">
                {createdTicket.title}
              </p>
            </section>
          )}

          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                {filterLabel}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Cari tiket dan pantau status penanganannya.
              </p>
            </div>
            <Link
              href="/submit-ticket"
              className="rounded-xl bg-blue-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-800"
            >
              + Submit Tiket
            </Link>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 md:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nomor tiket, judul, kategori..."
                className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--foreground)] placeholder:text-[var(--muted)]"
              />
              <select
                value={filter}
                onChange={(event) => changeFilter(event.target.value)}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--foreground)]"
              >
                <option value="All">Semua tiket</option>
                <option value="Active">Tiket aktif</option>
                <option value="Progress">Sedang diproses</option>
                <option value="Completed">Tiket selesai</option>
                {statuses.filter((status) => status !== "All").map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-secondary)] text-xs uppercase text-[var(--muted)]">
                  <tr>
                    <th className="px-5 py-4">Nomor tiket</th>
                    <th className="px-5 py-4">Permintaan</th>
                    <th className="px-5 py-4">Prioritas</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filtered.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="cursor-pointer hover:bg-[var(--surface-secondary)]"
                      onClick={() => setSelected(ticket)}
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-600">
                        {ticket.id}
                      </td>
                      <td className="min-w-56 px-5 py-4">
                        <p className="font-medium text-[var(--foreground)]">
                          {ticket.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {ticket.category} · {ticket.subcategory}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[var(--foreground)]">
                        {ticket.priority}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${statusClass(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[var(--muted)]">
                        {ticket.date}
                      </td>
                    </tr>
                  ))}
                  {loaded && filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-[var(--muted)]">
                        Tidak ada tiket yang cocok dengan filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-[var(--border)] px-5 py-4 text-xs text-[var(--muted)]">
              {loaded ? filtered.length : "—"} tiket ditampilkan
            </div>
          </section>

          {selected && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
              onClick={() => setSelected(null)}
            >
              <section
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--foreground)] shadow-xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-blue-600">
                      {selected.id}
                    </p>
                    <h2 className="mt-2 text-xl font-bold">{selected.title}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    aria-label="Tutup detail tiket"
                    className="rounded-lg px-3 py-2 text-[var(--muted)] hover:bg-[var(--surface-secondary)]"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-5 space-y-4 text-sm">
                  <p>Kategori: {selected.category} / {selected.subcategory}</p>
                  <p>Prioritas: {selected.priority}</p>
                  <p>Dampak: {selected.impact}</p>
                  <p>Departemen: {selected.department}</p>
                  <p>Lokasi: {selected.location}</p>
                  <p>Status: {selected.status}</p>
                  <p>Tanggal: {selected.date}</p>
                  <div>
                    <p className="mb-2 text-[var(--muted)]">Deskripsi</p>
                    <p className="whitespace-pre-wrap rounded-xl bg-[var(--surface-secondary)] p-4 leading-6">
                      {selected.description}
                    </p>
                  </div>
                  {selected.attachmentName && (
                    <p>Nama lampiran: {selected.attachmentName}</p>
                  )}
                </div>
              </section>
            </div>
          )}

          <footer className="pb-5 text-center text-xs text-[var(--muted)]">
            IT Service Desk · Local Prototype
          </footer>
        </div>
      </main>
    </div>
  );
}
