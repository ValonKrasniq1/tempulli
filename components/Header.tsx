"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const menu = [
  {
    label: "LAJME",
    href: "/category/lajme",
    items: [
      ["Lugina e Preshevës", "/subcategory/lugina-e-presheves"],
      ["Kosovë", "/subcategory/kosove"],
      ["Shqipëri", "/subcategory/shqiperi"],
      ["Diasporë", "/subcategory/diaspore"],
      ["Rajon", "/subcategory/rajon"],
      ["Evropë", "/subcategory/evrope"],
      ["Botë", "/subcategory/bote"],
    ],
  },
  {
    label: "SPORT",
    href: "/category/sport",
    items: [
      ["Futboll", "/subcategory/futboll"],
      ["Basketboll", "/subcategory/basketboll"],
      ["Formula 1", "/subcategory/formula-1"],
      ["Sporte të tjera", "/subcategory/sporte-te-tjera"],
    ],
  },
  {
    label: "TECH & AUTO",
    href: "/category/tech-auto",
    items: [
      ["Teknologji", "/subcategory/teknologji"],
      ["Automjete", "/subcategory/automjete"],
      ["Telefona", "/subcategory/telefona"],
      ["Lojëra", "/subcategory/lojera"],
    ],
  },
  {
    label: "FUN",
    href: "/category/fun",
    items: [
      ["Kuriozitete", "/subcategory/kuriozitete"],
      ["Fakte", "/subcategory/fakte"],
      ["Të tjera", "/subcategory/te-tjera"],
    ],
  },
  {
    label: "KULTURË",
    href: "/category/kulture",
    items: [
      ["Film", "/subcategory/film"],
      ["Muzikë", "/subcategory/muzike"],
      ["Histori", "/subcategory/histori"],
      ["Libra", "/subcategory/libra"],
      ["Fotografi", "/subcategory/fotografi"],
    ],
  },
  {
    label: "EKONOMI",
    href: "/category/ekonomi",
    items: [
      ["Financa", "/subcategory/financa"],
      ["Biznes", "/subcategory/biznes"],
    ],
  },
  {
    label: "MAGAZINA",
    href: "/category/magazina",
    items: [
      ["Shëndeti", "/subcategory/shendeti"],
      ["Jetë", "/subcategory/jete"],
      ["Lifestyle", "/subcategory/lifestyle"],
      ["Kuriozitete", "/subcategory/kuriozitete-magazina"],
    ],
  },
];

export default function Header() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    if (!search.trim()) return;

    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <h1 className="text-4xl font-extrabold text-[#d41c3d] transition hover:opacity-80 md:text-5xl lg:text-6xl">
              TEMPULLI
            </h1>
          </Link>

          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="rounded border px-3 py-2 text-2xl font-bold text-black lg:hidden"
            aria-label="Hap menynë"
          >
            {mobileOpen ? "×" : "☰"}
          </button>

          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko lajme..."
              className="w-72 rounded-full border-2 border-[#d41c3d] px-5 py-2.5 pr-12 text-base font-medium text-black placeholder:text-gray-400 outline-none"
            />

            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
            >
              🔍
            </button>
          </form>
        </div>

        <nav className="hidden items-center gap-1 border-t py-0 lg:flex">
          <Link
            href="/"
            className="px-3 py-4 text-sm font-bold text-black hover:text-[#d41c3d]"
          >
            BALLINA
          </Link>

          {menu.map((group) => (
            <div key={group.label} className="group relative">
              <Link
                href={group.href}
                className="block px-3 py-4 text-sm font-bold text-black hover:text-[#d41c3d]"
              >
                {group.label}
              </Link>

              <div className="invisible absolute left-0 top-full z-50 w-64 rounded-b-xl border bg-white p-3 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                {group.items.map(([label, href]) => (
                  <Link
                    key={label}
                    href={href}
                    className="block rounded px-3 py-2 text-sm font-semibold text-black hover:bg-gray-100 hover:text-[#d41c3d]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {mobileOpen && (
          <div className="border-t pb-5 lg:hidden">
            <form onSubmit={handleSearch} className="relative my-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Kërko lajme..."
                className="w-full rounded-full border-2 border-[#d41c3d] px-5 py-3 pr-12 text-base font-medium text-black placeholder:text-gray-400 outline-none"
              />

              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
              >
                🔍
              </button>
            </form>

            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block border-b py-3 text-base font-bold text-black"
            >
              BALLINA
            </Link>

            {menu.map((group) => (
              <div key={group.label} className="border-b">
                <button
                  onClick={() =>
                    setOpenMobileMenu((prev) =>
                      prev === group.label ? null : group.label
                    )
                  }
                  className="flex w-full items-center justify-between py-3 text-left text-base font-bold text-black"
                >
                  {group.label}
                  <span>{openMobileMenu === group.label ? "−" : "+"}</span>
                </button>

                {openMobileMenu === group.label && (
                  <div className="pb-3">
                    <Link
                      href={group.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded bg-gray-100 px-3 py-2 text-sm font-bold text-[#d41c3d]"
                    >
                      Të gjitha nga {group.label}
                    </Link>

                    {group.items.map(([label, href]) => (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 text-sm font-semibold text-black"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}