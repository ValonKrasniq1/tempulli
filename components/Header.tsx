"use client";

import Link from "next/link";
import PreferencesControls from "./PreferencesControls";
import { usePreferences } from "./PreferencesProvider";
import { useRouter, usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";

const menu = [
  {
    label: "Lajme",
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
    label: "Sport",
    href: "/category/sport",
    items: [
      ["Futboll", "/subcategory/futboll"],
      ["Basketboll", "/subcategory/basketboll"],
      ["Formula 1", "/subcategory/formula-1"],
      ["Sporte të tjera", "/subcategory/sporte-te-tjera"],
    ],
  },
  {
    label: "Tech & Auto",
    href: "/category/tech-auto",
    items: [
      ["Teknologji", "/subcategory/teknologji"],
      ["Automjete", "/subcategory/automjete"],
      ["Telefona", "/subcategory/telefona"],
      ["Lojëra", "/subcategory/lojera"],
    ],
  },
  {
    label: "Fun",
    href: "/category/fun",
    items: [
      ["Kuriozitete", "/subcategory/kuriozitete"],
      ["Fakte", "/subcategory/fakte"],
      ["Të tjera", "/subcategory/te-tjera"],
    ],
  },
  {
    label: "Kulturë",
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
    label: "Ekonomi",
    href: "/category/ekonomi",
    items: [
      ["Financa", "/subcategory/financa"],
      ["Biznes", "/subcategory/biznes"],
    ],
  },
  {
    label: "Magazina",
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
  const pathname = usePathname();
  const { t } = usePreferences();

  const translations: Record<string, string> = {
    "Lajme": "News",
    "Lugina e Preshevës": "Presevo Valley",
    "Kosovë": "Kosovo",
    "Shqipëri": "Albania",
    "Diasporë": "Diaspora",
    "Rajon": "Region",
    "Evropë": "Europe",
    "Botë": "World",
    "Sport": "Sports",
    "Futboll": "Football",
    "Basketboll": "Basketball",
    "Formula 1": "Formula 1",
    "Sporte të tjera": "Other sports",
    "Tech & Auto": "Tech & Auto",
    "Teknologji": "Technology",
    "Automjete": "Automotive",
    "Telefona": "Smartphones",
    "Lojëra": "Gaming",
    "Fun": "Fun",
    "Kuriozitete": "Curiosities",
    "Fakte": "Facts",
    "Të tjera": "Other",
    "Kulturë": "Culture",
    "Film": "Film",
    "Muzikë": "Music",
    "Histori": "History",
    "Libra": "Books",
    "Fotografi": "Photography",
    "Ekonomi": "Economy",
    "Financa": "Finance",
    "Biznes": "Business",
    "Magazina": "Magazine",
    "Shëndeti": "Health",
    "Jetë": "Life",
    "Lifestyle": "Lifestyle",
  };

  function translateLabel(label: string) {
    return t(label, translations[label] || label);
  }
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!search.trim()) return;

    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    setSearch("");
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white text-black">

      {/* Header kryesor */}
      <div className="tempulli-container flex h-[76px] items-center justify-between gap-2 lg:gap-4">

        {/* Logo dhe menu */}
        <div className="flex items-center gap-4">

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={t("Hap ose mbyll menynë", "Toggle menu")}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-gray-100"
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h12" />
            </svg>
          </button>

          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-[27px] font-black tracking-[-1.5px] text-[#d41c3d] sm:text-[34px]"
          >
            TEMPULLI
          </Link>
        </div>

        {/* Navigimi kryesor */}
        <nav className="hidden h-full items-center gap-5 lg:flex">

          <Link
            href="/"
            className={`flex h-full items-center border-b-2 text-xs font-extrabold transition ${pathname === "/" ? "border-[#d41c3d] text-[#d41c3d]" : "border-transparent text-gray-500 hover:text-[#d41c3d]"}`}
          >
            {t("BALLINA", "HOME")}
          </Link>

          <Link
  href="/discover"
  className={`flex h-full items-center border-b-2 text-xs font-extrabold transition ${pathname === "/discover" ? "border-[#d41c3d] text-[#d41c3d]" : "border-transparent text-gray-500 hover:text-[#d41c3d]"}`}
>
  DISCOVER
</Link>

          

          <button
            type="button"
            disabled
            title={t("Në zhvillim", "Coming soon")}
            className="text-xs font-extrabold text-gray-400"
          >
            VIDEO
          </button>

        </nav>

        {/* Kërkimi dhe preferencat */}
        <div className="flex items-center gap-3">

          <form
            onSubmit={handleSearch}
            className="hidden items-center rounded-lg border border-gray-200 bg-gray-50 px-3 xl:flex"
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Kërko lajme...", "Search news...")}
              aria-label={t("Kërko lajme", "Search news")}
              className="h-10 w-28 bg-transparent text-sm outline-none 2xl:w-44"
            />

            <button type="submit" aria-label={t("Kërko", "Search")}>
              <SearchIcon />
            </button>
          </form>

          <div className="hidden sm:flex"><PreferencesControls /></div>
<button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label={t("Hap kërkimin", "Open search")}
            aria-expanded={searchOpen}
            className="rounded-lg p-2 hover:bg-gray-100 xl:hidden"
          >
            <SearchIcon />
          </button>

        </div>
      </div>

      {/* Kategoritë */}
      <div className="hidden border-t border-gray-100 lg:block">
        <nav className="tempulli-container flex flex-wrap items-center gap-x-5 gap-y-1">

          {menu.map((group) => (
            <div key={group.label} className="group relative">

              <Link
                href={group.href}
                className="block py-3 text-xs font-bold uppercase transition hover:text-[#d41c3d]"
              >
                {translateLabel(group.label)}
              </Link>

              <div className="invisible absolute left-0 top-full z-50 w-56 rounded-b-xl border border-gray-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">

                {group.items.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-red-50 hover:text-[#d41c3d]"
                  >
                    {translateLabel(label)}
                  </Link>
                ))}

              </div>
            </div>
          ))}

          <div className="ml-auto flex items-center gap-2 py-2">
            <PlatformLinks />
          </div>
        </nav>
      </div>

      <div className="tempulli-container flex justify-end border-t border-gray-100 py-2 sm:hidden">
  <PreferencesControls />
</div>

<nav aria-label={t("Platformat", "Platforms")} className="tempulli-container flex justify-end gap-2 border-t border-gray-100 py-2 lg:hidden">
        <PlatformLinks />
      </nav>

      {/* Kërkimi në mobile */}
      {searchOpen && (
        <form
          onSubmit={handleSearch}
          className="flex gap-2 border-t border-gray-100 bg-white p-4"
        >
          <input
            autoFocus
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Kërko lajme...", "Search news...")}
            aria-label={t("Kërko lajme", "Search news")}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#d41c3d]"
          />

          <button
            type="submit"
            className="rounded-lg bg-[#d41c3d] px-5 text-sm font-bold text-white"
          >
            {t("Kërko", "Search")}
          </button>
        </form>
      )}

      {/* Menu anësore */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100]">

          <button
            type="button"
            aria-label={t("Mbyll menynë", "Close menu")}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <aside className="relative flex h-full w-[320px] max-w-[90vw] flex-col overflow-y-auto bg-white p-5 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-black tracking-tight text-[#d41c3d]"
              >
                TEMPULLI
              </Link>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label={t("Mbyll menynë", "Close menu")}
                className="rounded-lg px-3 py-1 text-2xl hover:bg-gray-100"
              >
                ×
              </button>

            </div>

            <p className="mb-3 text-[11px] font-bold tracking-widest text-gray-400">
              {t("NAVIGIMI", "NAVIGATION")}
            </p>

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`mb-1 rounded-lg px-4 py-3 text-sm font-bold ${pathname === "/" ? "bg-red-50 text-[#d41c3d]" : "text-gray-700 hover:bg-gray-100"}`}
            >
              {t("Ballina", "Home")}
            </Link>

            <Link
  href="/discover"
  onClick={() => setMenuOpen(false)}
  className={`mb-4 rounded-lg px-4 py-3 text-sm font-bold ${pathname === "/discover" ? "bg-red-50 text-[#d41c3d]" : "text-gray-700 hover:bg-gray-100"}`}
>
  Discover
</Link>

<div className="mb-5 flex flex-wrap gap-2">
              <PlatformLinks onNavigate={() => setMenuOpen(false)} />
            </div>

            <p className="mb-3 text-[11px] font-bold tracking-widest text-gray-400">
              {t("KATEGORITË", "CATEGORIES")}
            </p>

            {menu.map((group) => (
              <div key={group.label} className="border-b border-gray-100">

                <button
                  type="button"
                  onClick={() =>
                    setExpanded(
                      expanded === group.label ? null : group.label
                    )
                  }
                  aria-expanded={expanded === group.label}
                  className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-bold hover:bg-gray-50"
                >
                  {translateLabel(group.label)}

                  <span className="text-lg text-gray-400">
                    {expanded === group.label ? "−" : "+"}
                  </span>
                </button>

                {expanded === group.label && (
                  <div className="space-y-1 pb-3 pl-4">

                    <Link
                      href={group.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 text-sm font-bold text-[#d41c3d]"
                    >
                      {t("Të gjitha", "All")}
                    </Link>

                    {group.items.map(([label, href]) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#d41c3d]"
                      >
                        {translateLabel(label)}
                      </Link>
                    ))}

                  </div>
                )}

              </div>
            ))}

            <div className="mt-8 rounded-xl bg-gray-100 p-4">

              <p className="text-xs font-bold text-gray-500">
                TEMPULLI MEDIA
              </p>

              <p className="mt-2 text-sm text-gray-600">
                {t("Informohu. Zbulo. Lexo.", "Stay informed. Discover. Read.")}
              </p>

            </div>

          </aside>
        </div>
      )}

    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function PlatformLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = usePreferences();
  return (
    <>
      <button
        type="button"
        disabled
        title={t("Shit-Bli është në zhvillim", "Marketplace coming soon")}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 disabled:cursor-not-allowed"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 8h14l1 13H4L5 8Z" />
          <path d="M9 9V6a3 3 0 0 1 6 0v3" />
        </svg>
        {t("SHIT-BLI", "MARKETPLACE")}
      </button>
      <Link
        href="/subcategory/teknologji"
        onClick={onNavigate}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-[#288b5f] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#206e4b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#288b5f]"
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="5" y="5" width="14" height="14" rx="2" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
          <path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" />
        </svg>
        TEMPULLI TECH <span aria-hidden="true">↗</span>
      </Link>
    </>
  );
}




