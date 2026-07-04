"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      alert("Shkruaj emailin dhe fjalëkalimin.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Email ose fjalëkalim i pasaktë.");
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold text-[#d41c3d]">
            TEMPULLI
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-600">
            Hyr në panelin e administrimit
          </p>
        </div>

        <form onSubmit={handleLogin} className="rounded-xl bg-white p-8 shadow">
          <label className="mb-2 block text-sm font-bold text-black">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@tempulli.info"
            className="mb-5 w-full rounded border p-3 text-black outline-none focus:border-[#d41c3d]"
          />

          <label className="mb-2 block text-sm font-bold text-black">
            Fjalëkalimi
          </label>
          <div className="mb-5 flex rounded border focus-within:border-[#d41c3d]">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Shkruaj fjalëkalimin"
              className="w-full rounded-l p-3 text-black outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="px-4 text-sm font-bold text-[#d41c3d]"
            >
              {showPassword ? "Fsheh" : "Shfaq"}
            </button>
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Mbamë mend
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-bold text-[#d41c3d]"
            >
              Harrove fjalëkalimin?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[#d41c3d] px-4 py-3 font-extrabold text-white disabled:opacity-60"
          >
            {loading ? "Duke hyrë..." : "Hyr"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/" className="font-bold text-gray-700">
            ← Shko te Tempulli
          </Link>
        </div>
      </div>
    </main>
  );
}