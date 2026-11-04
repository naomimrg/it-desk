
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
        <h1 className="text-2xl font-bold">
          Akses Ditolak
        </h1>

        <p className="mt-3 text-slate-300">
          Akun Microsoft 365 kamu tidak memiliki
          izin untuk membuka halaman ini.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
        >
          Kembali ke Dashboard
        </Link>
      </section>
    </main>
  );
}
