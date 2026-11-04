
"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Username atau password salah.");
        setLoading(false);
        return;
      }

      const normalizedUsername = username.trim().toLowerCase();

      if (normalizedUsername === "wahyu") {
        router.replace("/admin");
      } else if (["naomi", "fajar"].includes(normalizedUsername)) {
        router.replace("/technician");
      } else {
        router.replace("/");
      }

      router.refresh();
    } catch {
      setError("Login gagal. Pastikan server sedang berjalan.");
      setLoading(false);
    }
  }

  const inputClass =
    "min-w-0 w-full border-0 bg-transparent py-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0";

  const fieldClass =
    "flex items-center gap-3 rounded-xl border border-[#304159] bg-[#111f33] px-4 transition duration-200 focus-within:border-blue-400 focus-within:bg-[#14243b] focus-within:ring-4 focus-within:ring-blue-500/10";

  return (
    <main className="min-h-screen bg-[#061426] text-white lg:grid lg:grid-cols-[1.2fr_0.8fr]">
      {/* Panel kiri: foto interior */}
      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <Image
          src="/amti-office-interior.jpg"
          alt="Interior kantor AMTI"
          fill
          priority
          sizes="60vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#041020]/95 via-[#041020]/25 to-[#041020]/5" />
        <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[#061426]/35 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-10 p-10 xl:p-14">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-9 bg-blue-400" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200">
              AMTI · IT Service Desk
            </p>
          </div>

          <h2 className="max-w-xl text-3xl font-semibold leading-[1.18] tracking-tight text-white xl:text-[42px]">
            Dukungan teknologi untuk operasional yang lebih andal.
          </h2>

          <p className="mt-5 max-w-md text-sm leading-6 text-white/75">
            Satu portal untuk mengajukan permintaan IT dan memantau penanganan
            tiket dengan lebih mudah.
          </p>
        </div>
      </section>

      {/* Panel kanan: login */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(30,91,170,0.16),transparent_42%),linear-gradient(145deg,#08172a_0%,#061426_48%,#07182c_100%)] px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-sky-300/[0.09]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full border border-sky-300/[0.08]"
        />

        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-4">
            <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-xl bg-white p-1.5 shadow-lg shadow-black/10">
              <Image
                src="/amti-logo.jpeg"
                alt="Logo AMTI"
                fill
                priority
                sizes="58px"
                className="object-contain"
              />
            </div>

            <div className="border-l border-white/15 pl-4">
              <p className="text-lg font-bold tracking-[0.28em] text-white">
                AMTI
              </p>
              <p className="mt-1 text-[9px] font-medium uppercase leading-4 tracking-[0.16em] text-slate-400">
                Asset Monitoring
                <br />
                Teknologi Indonesia
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-0.5 w-7 rounded-full bg-blue-500" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300">
                IT Service Desk
              </p>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-[38px]">
              Selamat datang
            </h1>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
              Masuk untuk mengakses IT Service Desk AMTI dan mendapatkan
              dukungan IT dengan lebih cepat dan terintegrasi.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="mb-2.5 block text-sm font-medium text-slate-200"
              >
                Username
              </label>

              <div className={fieldClass}>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 shrink-0 text-slate-400"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path
                    d="M5 20c.6-3.4 3.1-5.2 7-5.2s6.4 1.8 7 5.2"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Masukkan username"
                  required
                  className={inputClass}
                  style={{
                    backgroundColor: "transparent",
                    color: "#ffffff",
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2.5 block text-sm font-medium text-slate-200"
              >
                Password
              </label>

              <div className={fieldClass}>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 shrink-0 text-slate-400"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    strokeLinecap="round"
                  />
                  <path d="M12 14v3" strokeLinecap="round" />
                </svg>

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  required
                  className={inputClass}
                  style={{
                    backgroundColor: "transparent",
                    color: "#ffffff",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="shrink-0 rounded-md p-1 text-slate-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {showPassword ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M3 3l18 18" />
                      <path
                        d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9 7 9 7a15 15 0 0 1-3.1 3.8M6.2 6.2C4.1 7.6 3 12 3 12s3.5 7 9 7c1 0 1.9-.2 2.7-.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-sky-500 hover:shadow-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#061426] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses login..." : "Masuk ke Dashboard"}
              {!loading && (
                <span
                  aria-hidden="true"
                  className="text-lg transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-9 flex items-center gap-3 text-[11px] text-slate-500">
            <span className="h-px flex-1 bg-white/10" />
            <span>IT Service Desk · AMTI</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
        </div>
      </section>
    </main>
  );
}
