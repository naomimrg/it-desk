
export type TicketStatus =
  | "Open"
  | "Assigned"
  | "In Progress"
  | "Waiting for User"
  | "Resolved"
  | "Closed";

export type TicketNote = {
  id: string;
  author: string;
  text: string;
  date: string;
};

export type Ticket = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  priority: string;
  impact: string;
  department: string;
  location: string;
  status: TicketStatus;
  date: string;
  description: string;
  attachmentName: string;
  assignedTechnician: string;
  notes: TicketNote[];
};

export type NewTicket = Omit<
  Ticket,
  | "id"
  | "date"
  | "status"
  | "assignedTechnician"
  | "notes"
>;

const STORAGE_KEY = "it-service-desk-tickets-v1";
const COUNTER_KEY = "it-service-desk-ticket-counter-v1";
const CHANGE_EVENT = "it-service-desk-tickets-changed";


export const technicians = [
  "Naomi Manurung",
  "Fajar Chan",
];

export const initialTickets: Ticket[] = [
  {
    id: "IT-2026-001",
    title: "Laptop tidak bisa terhubung Wi-Fi",
    category: "Network",
    subcategory: "Wi-Fi / Internet",
    priority: "High",
    impact: "Beberapa pengguna",
    department: "IT",
    location: "Kantor pusat",
    status: "In Progress",
    date: "14 Okt 2026",
    description: "Koneksi Wi-Fi laptop terputus.",
    attachmentName: "",
    assignedTechnician: "Budi Santoso",
    notes: [],
  },
  {
    id: "IT-2026-002",
    title: "Permintaan akses aplikasi",
    category: "Account & Access",
    subcategory: "Akses aplikasi",
    priority: "Medium",
    impact: "Saya sendiri",
    department: "Finance",
    location: "Kantor pusat",
    status: "Open",
    date: "14 Okt 2026",
    description: "Memerlukan akses ke aplikasi perusahaan.",
    attachmentName: "",
    assignedTechnician: "",
    notes: [],
  },
  {
    id: "IT-2026-003",
    title: "Instalasi software",
    category: "Software",
    subcategory: "Instalasi software",
    priority: "Low",
    impact: "Saya sendiri",
    department: "HR",
    location: "Kantor pusat",
    status: "Resolved",
    date: "13 Okt 2026",
    description: "Permintaan instalasi software.",
    attachmentName: "",
    assignedTechnician: "Andi Pratama",
    notes: [],
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === "string" &&
    [
      "Open",
      "Assigned",
      "In Progress",
      "Waiting for User",
      "Resolved",
      "Closed",
    ].includes(value)
  );
}

function isTicketNote(value: unknown): value is TicketNote {
  if (!value || typeof value !== "object") return false;

  const note = value as Record<string, unknown>;

  return (
    typeof note.id === "string" &&
    typeof note.author === "string" &&
    typeof note.text === "string" &&
    typeof note.date === "string"
  );
}

// Memastikan tiket lama tetap bisa dibaca.
function isTicket(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  const ticket = value as Record<string, unknown>;

  return (
    typeof ticket.id === "string" &&
    typeof ticket.title === "string" &&
    typeof ticket.category === "string" &&
    typeof ticket.subcategory === "string" &&
    typeof ticket.priority === "string" &&
    typeof ticket.impact === "string" &&
    typeof ticket.department === "string" &&
    typeof ticket.location === "string" &&
    isTicketStatus(ticket.status) &&
    typeof ticket.date === "string" &&
    typeof ticket.description === "string" &&
    typeof ticket.attachmentName === "string" &&
    (
      ticket.assignedTechnician === undefined ||
      typeof ticket.assignedTechnician === "string"
    ) &&
    (
      ticket.notes === undefined ||
      (
        Array.isArray(ticket.notes) &&
        ticket.notes.every(isTicketNote)
      )
    )
  );
}

function normalizeTicket(ticket: Ticket): Ticket {
  return {
    ...ticket,
    assignedTechnician: ticket.assignedTechnician ?? "",
    notes: ticket.notes ?? [],
  };
}

function ticketNumber(id: string): number {
  const match = id.match(/^IT-\d{4}-(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function announceChange(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function syncCounter(tickets: Ticket[]): void {
  if (!isBrowser()) return;

  const maxExisting = Math.max(
    0,
    ...tickets.map((ticket) => ticketNumber(ticket.id))
  );

  const savedCounter =
    Number(localStorage.getItem(COUNTER_KEY)) || 0;

  localStorage.setItem(
    COUNTER_KEY,
    String(Math.max(savedCounter, maxExisting))
  );
}

export function getTickets(): Ticket[] {
  if (!isBrowser()) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored !== null) {
      const parsed: unknown = JSON.parse(stored);

      if (Array.isArray(parsed) && parsed.every(isTicket)) {
        const normalized = parsed.map((ticket) =>
          normalizeTicket(ticket as Ticket)
        );

        syncCounter(normalized);
        return normalized;
      }

      throw new Error(
        "Format data tiket tidak valid. Data asli tidak dihapus."
      );
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialTickets)
    );

    syncCounter(initialTickets);
    announceChange();

    return initialTickets;
  } catch (error) {
    console.error("Gagal membaca data tiket:", error);
    throw new Error(
      "Data tiket tidak dapat dibaca. Periksa penyimpanan browser."
    );
  }
}

export function saveTickets(tickets: Ticket[]): void {
  if (!isBrowser()) {
    throw new Error("Penyimpanan hanya tersedia di browser.");
  }

  if (!tickets.every(isTicket)) {
    throw new Error("Format salah satu tiket tidak valid.");
  }

  const normalized = tickets.map(normalizeTicket);

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalized)
    );

    syncCounter(normalized);
    announceChange();
  } catch (error) {
    console.error("Gagal menyimpan data tiket:", error);
    throw new Error(
      "Data tiket gagal disimpan. Periksa ruang penyimpanan browser."
    );
  }
}

export function createTicket(data: NewTicket): Ticket {
  if (!isBrowser()) {
    throw new Error("Tiket hanya dapat dibuat di browser.");
  }

  if (
    !data.title.trim() ||
    !data.description.trim() ||
    !data.department.trim() ||
    !data.location.trim()
  ) {
    throw new Error(
      "Judul, deskripsi, departemen, dan lokasi wajib diisi."
    );
  }

  const tickets = getTickets();

  const currentCounter =
    Number(localStorage.getItem(COUNTER_KEY)) || 0;

  const maxExisting = Math.max(
    0,
    ...tickets.map((ticket) => ticketNumber(ticket.id))
  );

  const nextNumber =
    Math.max(currentCounter, maxExisting) + 1;

  const year = new Date().getFullYear();

  const ticket: Ticket = {
    ...data,
    title: data.title.trim(),
    description: data.description.trim(),
    id: `IT-${year}-${String(nextNumber).padStart(3, "0")}`,
    date: new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    status: "Open",
    assignedTechnician: "",
    notes: [],
  };

  saveTickets([ticket, ...tickets]);

  localStorage.setItem(COUNTER_KEY, String(nextNumber));

  return ticket;
}

export function assignTechnician(
  ticketId: string,
  technician: string
): void {
  const tickets = getTickets();
  const ticket = tickets.find((item) => item.id === ticketId);

  if (!ticket) {
    throw new Error("Tiket tidak ditemukan.");
  }

  if (
    technician &&
    !technicians.includes(technician)
  ) {
    throw new Error("Nama teknisi tidak valid.");
  }

  ticket.assignedTechnician = technician;

  // Status Open berubah menjadi Assigned saat teknisi dipilih.
  if (technician && ticket.status === "Open") {
    ticket.status = "Assigned";
  }

  // Jika penugasan dihapus, Assigned kembali menjadi Open.
  if (!technician && ticket.status === "Assigned") {
    ticket.status = "Open";
  }

  saveTickets(tickets);
}

export function addTicketNote(
  ticketId: string,
  author: string,
  text: string
): TicketNote {
  const cleanAuthor = author.trim();
  const cleanText = text.trim();

  if (!cleanAuthor || !cleanText) {
    throw new Error(
      "Nama penulis dan isi catatan wajib diisi."
    );
  }

  const tickets = getTickets();
  const ticket = tickets.find((item) => item.id === ticketId);

  if (!ticket) {
    throw new Error("Tiket tidak ditemukan.");
  }

  const note: TicketNote = {
    id: `NOTE-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    author: cleanAuthor,
    text: cleanText,
    date: new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  ticket.notes = [...(ticket.notes ?? []), note];

  saveTickets(tickets);

  return note;
}

export function subscribeToTickets(
  callback: () => void
): () => void {
  if (!isBrowser()) return () => {};

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      callback();
    }
  };

  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function statusClass(status: TicketStatus): string {
  const styles: Record<TicketStatus, string> = {
    Open: "bg-blue-50 text-blue-700",
    Assigned: "bg-indigo-50 text-indigo-700",
    "In Progress": "bg-violet-50 text-violet-700",
    "Waiting for User": "bg-amber-50 text-amber-700",
    Resolved: "bg-emerald-50 text-emerald-700",
    Closed: "bg-slate-100 text-slate-600",
  };

  return styles[status];
}
