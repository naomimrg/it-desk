"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { createTicket } from "@/lib/tickets";

const categories: Record<string, string[]> = {
  Hardware: ["Laptop / PC", "Monitor", "Printer", "Keyboard / Mouse", "Lainnya"],
  Software: ["Aplikasi error", "Instalasi software", "Update software", "Lainnya"],
  Network: ["Wi-Fi / Internet", "LAN", "VPN", "Jaringan lambat", "Lainnya"],
  "Account & Access": ["Reset password", "Akses aplikasi", "Akun terkunci", "Akun baru", "Lainnya"],
  Installation: ["Instalasi perangkat", "Instalasi aplikasi", "Konfigurasi perangkat", "Lainnya"],
  Email: ["Email tidak bisa dibuka", "Email tidak terkirim", "Distribusi email", "Lainnya"],
  Other: ["Pertanyaan IT", "Permintaan lainnya"],
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function SubmitTicketPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Hardware");
  const [subcategory, setSubcategory] = useState(categories.Hardware[0]);
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const ticket = createTicket({
        title: title.trim(),
        department,
        location: location.trim(),
        category,
        subcategory,
        priority,
        impact: "Saya sendiri",
        description: description.trim(),
        attachmentName,
      });

      router.push(`/my-tickets?created=${encodeURIComponent(ticket.id)}`);
    } catch {
      setError("Tiket gagal disimpan. Silakan coba kembali.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <main className="min-h-screen min-w-0 lg:ml-64">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-4 py-5 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Employee Portal <span className="px-1 text-slate-300">/</span> Submit Tiket
              </p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Buat Tiket Baru
              </h1>
            </div>
            <Link
              href="/"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:inline-flex">
              Kembali ke Dashboard
            </Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-sm sm:p-8">
            <p className="text-sm font-medium text-blue-100">Employee Portal</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Form Permintaan IT
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Lengkapi informasi berikut agar tim IT memahami kebutuhanmu.
            </p>
          </section>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
            <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
              <div className="mb-5">
                <h3 className="font-semibold text-slate-900">Informasi pelapor</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Isi departemen dan lokasi kerja agar tim IT dapat menindaklanjuti permintaan.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Departemen <span className="text-blue-700">*</span>
                  </label>
                  <select
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={inputClass}>
                    <option value="">Pilih departemen</option>
                    <option>IT</option>
                    <option>Finance</option>
                    <option>HR</option>
                    <option>Operations</option>
                    <option>Production</option>
                    <option>Engineering</option>
                    <option>Sales & Marketing</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Lokasi kerja <span className="text-blue-700">*</span>
                  </label>
                  <input
                    required
                    maxLength={100}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Contoh: Kantor pusat / Plant 1"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Judul permintaan <span className="text-blue-700">*</span>
              </label>
              <input
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Laptop tidak bisa dinyalakan"
                className={inputClass}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Kategori <span className="text-blue-700">*</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCategory(next);
                    setSubcategory(categories[next][0]);
                  }}
                  className={inputClass}>
                  {Object.keys(categories).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Subkategori <span className="text-blue-700">*</span>
                </label>
                <select
                  required
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className={inputClass}>
                  {categories[category].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Prioritas usulan <span className="text-blue-700">*</span>
                </label>
                <select
                  required
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={inputClass}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Tim IT dapat menyesuaikan prioritas akhir.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Lampiran opsional
                </label>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf,.txt,.doc,.docx,.xlsx"
                  onChange={(e) =>
                    setAttachmentName(e.target.files?.[0]?.name ?? "")
                  }
                  className={inputClass} />
                {attachmentName && (
                  <p className="mt-2 text-xs text-slate-500">
                    File dipilih: {attachmentName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Deskripsi permintaan <span className="text-blue-700">*</span>
              </label>
              <textarea
                required
                minLength={5}
                maxLength={3000}
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan masalah dan bantuan yang dibutuhkan..."
                className={inputClass}
              />
              <p className="mt-2 text-xs text-slate-500">
                {description.length}/3000 karakter
              </p>
            </div>

            {error && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:from-blue-800 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Submit Tiket
              </button>
              <Link
                href="/"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                Batal
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
