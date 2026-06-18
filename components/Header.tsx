"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!search.trim()) return;

    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/">
          <h1 className="cursor-pointer text-6xl font-extrabold text-[#d41c3d] transition hover:opacity-80">
            TEMPULLI
          </h1>
        </Link>

        <nav className="flex flex-wrap items-center gap-6 text-base font-semibold text-black">
          <Link href="/" className="hover:text-[#d41c3d]">Ballina</Link>
          <Link href="/lugina" className="hover:text-[#d41c3d]">Lugina</Link>
          <Link href="/kosove" className="hover:text-[#d41c3d]">Kosovë</Link>
          <Link href="/sport" className="hover:text-[#d41c3d]">Sport</Link>
          <Link href="/teknologji" className="hover:text-[#d41c3d]">Teknologji</Link>
        </nav>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kërko lajme..."
            className="w-80 rounded-full border-2 border-[#d41c3d] px-6 py-3 pr-14 text-lg font-medium text-black placeholder:text-gray-400 outline-none transition focus:border-[#d41c3d]"
          />

          <button
            type="submit"
            className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl"
          >
            🔍
          </button>
        </form>
      </div>
    </header>
  );
}