"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "./Header";
import { usePreferences } from "./PreferencesProvider";
import { supabase } from "../lib/supabase";

type Article = {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  subcategory?: string | null;
  image_url: string | null;
  lead: string | null;
  created_at: string;
};

const categories = [
  "Të gjitha",
  "Lajme",
  "Sport",
  "Tech & Auto",
  "Fun",
  "Kulturë",
  "Ekonomi",
  "Magazina",
];

const colors: Record<string, string> = {
  lajme: "#d41c3d",
  sport: "#2563eb",
  "tech & auto": "#288b5f",
  "tech-auto": "#288b5f",
  ekonomi: "#b7791f",
  fun: "#ea580c",
  kulturë: "#9333ea",
  magazina: "#db2777",
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function timeAgo(date: string) {
  const minutes = Math.max(
    0,
    Math.floor(
      (Date.now() - new Date(date).getTime()) / 60000
    )
  );

  if (minutes < 1) return "Sapo publikuar";
  if (minutes < 60) return `${minutes} min më parë`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} orë më parë`;

  return `${Math.floor(hours / 24)} ditë më parë`;
}

function Icon({
  name,
  filled = false,
}: {
  name: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "up" && <path d="m6 15 6-6 6 6" />}
      {name === "down" && <path d="m6 9 6 6 6-6" />}
      {name === "bookmark" && (
        <path d="M6 3h12v18l-6-4-6 4V3Z" />
      )}
      {name === "share" && (
        <>
          <path d="M12 15V3m-5 5 5-5 5 5" />
          <path d="M5 12v8h14v-8" />
        </>
      )}
      {name === "discover" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
        </>
      )}
      {name === "grid" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
      )}
      {name === "arrow" && (
        <path d="M6 18 18 6M6 6h12v12" />
      )}
    </svg>
  );
}

export default function DiscoverFeed({
  brand = "info",
}: {
  brand?: "info" | "tech";
}) {
  const isTech = brand === "tech";

  const {
    theme,
    language,
    toggleTheme,
    setLanguage,
    t,
  } = usePreferences();

  const darkMode = theme === "dark";
  const en = language === "en";

  const translatedCategories: Record<string, string> = {
    "Të gjitha": "All",
    "Lajme": "News",
    "Sport": "Sports",
    "Tech & Auto": "Tech & Auto",
    "Teknologji": "Technology",
    "Automjete": "Vehicles",
    "Telefona": "Smartphones",
    "Lojëra": "Gaming",
    "Fun": "Fun",
    "Kulturë": "Culture",
    "Ekonomi": "Economy",
    "Magazina": "Magazine",
  };

  function categoryLabel(value: string) {
    return en ? translatedCategories[value] || value : value;
  }

  function changeTheme() {
    toggleTheme();
  }

  function changeLanguage(value: "sq" | "en") {
    setLanguage(value);
  }

  const categories = isTech
    ? ["Të gjitha", "Teknologji", "Telefona", "Lojëra"]
    : ["Të gjitha", "Lajme", "Sport", "Tech & Auto", "Fun", "Kulturë", "Ekonomi", "Magazina"];
  const [view, setView] = useState<"feed" | "grid">("grid");
  const [query, setQuery] = useState("");
  const pendingIndex = useRef(0);

  useEffect(() => {
    try {
      if (localStorage.getItem(isTech ? "tempulli-tech-view" : "tempulli-view") === "grid") {
        setView("grid");
      }
    } catch {}
  }, []);

  function changeView(value: "feed" | "grid", index = activeIndex) {
    pendingIndex.current = index;
    setView(value);
    try {
      localStorage.setItem(isTech ? "tempulli-tech-view" : "tempulli-view", value);
    } catch {}
  }

  useEffect(() => {
    if (view !== "feed") return;
    const frame = requestAnimationFrame(() => {
      const feed = feedRef.current;
      const cards = feed?.querySelectorAll<HTMLElement>("[data-discover-card]");
      const card = cards?.[pendingIndex.current];

      if (feed && card) {
        feed.scrollTop += card.getBoundingClientRect().top -
          feed.getBoundingClientRect().top;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [view]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState("Të gjitha");
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);
  const [savedOnly, setSavedOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);

  const feedRef = useRef<HTMLDivElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* LOAD ARTICLES */

  useEffect(() => {
    let active = true;

    async function loadArticles() {
      setLoading(true);
      setError(false);

      try {
        let request = supabase
          .from("posts")
          .select("id,title,slug,category,subcategory,image_url,lead,created_at")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(100);

        if (isTech) {
          request = request.in("subcategory", [
            "Teknologji",
            "Telefona",
            "Lojëra"
          ]);
        }

        const { data, error } = await request;

        if (!active) return;

        if (error) throw error;

        setArticles((data || []) as Article[]);
      } catch (error) {
        if (active) {
          console.error(error);
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadArticles();

    return () => {
      active = false;
    };
  }, [retry, isTech]);

  /* SAVED ARTICLES */

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("tempulli-saved") || "[]"
      );

      if (Array.isArray(stored)) {
        setSaved(
          stored.filter(
            (id) => typeof id === "number"
          )
        );
      }
    } catch {
      setSaved([]);
    }

    return () => {
      if (noticeTimer.current) {
        clearTimeout(noticeTimer.current);
      }
    };
  }, []);

  const filteredArticles = articles.filter((article) => {
    const searchText = normalize(
      `${article.title} ${article.lead || ""} ${article.category || ""}`
    );
    if (query.trim() && !searchText.includes(normalize(query))) {
      return false;
    }
    if (savedOnly) {
      return saved.includes(article.id);
    }

    if (category === "Të gjitha") return true;

    return (
      normalize((isTech ? article.subcategory : article.category) || "") ===
      normalize(category)
    );
  });

  function showNotice(message: string) {
    setNotice(message);

    if (noticeTimer.current) {
      clearTimeout(noticeTimer.current);
    }

    noticeTimer.current = setTimeout(
      () => setNotice(""),
      2200
    );
  }

  function toggleSaved(id: number) {
    const exists = saved.includes(id);

    const next = exists
      ? saved.filter((item) => item !== id)
      : [...saved, id];

    setSaved(next);

    try {
      localStorage.setItem(
        "tempulli-saved",
        JSON.stringify(next)
      );

      showNotice(
        exists
          ? t("Lajmi u largua nga të ruajturat.", "Article removed from saved.")
          : t("Lajmi u ruajt.", "Article saved.")
      );
    } catch {
      showNotice("Ruajtja në pajisje nuk ishte e mundur.");
    }
  }

  async function shareArticle(article: Article) {
    const url =
      window.location.origin +
      `/article/${article.slug}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showNotice(t("Linku u kopjua.", "Link copied."));
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) return;

      showNotice(t("Linku nuk u shpërnda.", "Link could not be shared."));
    }
  }

  /* FILTERS */

  function changeCategory(value: string) {
    setCategory(value);
    setSavedOnly(false);
    setActiveIndex(0);

    feedRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }

  function openSaved() {
    setSavedOnly(true);
    setCategory("Të gjitha");
    setActiveIndex(0);

    feedRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }

  /* VERTICAL NAVIGATION */

  useEffect(() => {
    const feed = feedRef.current;

    if (!feed) return;

    let wheelTime = 0;

    function move(direction: number) {
      if (!feed) return;

      const cards = Array.from(
        feed.querySelectorAll<HTMLElement>(
          "[data-discover-card]"
        )
      );

      if (cards.length === 0) return;

      const feedTop = feed.getBoundingClientRect().top;

      const current = cards.reduce(
        (best, card, index) =>
          Math.abs(
            card.getBoundingClientRect().top - feedTop
          ) <
          Math.abs(
            cards[best].getBoundingClientRect().top - feedTop
          )
            ? index
            : best,
        0
      );

      const next = Math.max(
        0,
        Math.min(cards.length - 1, current + direction)
      );

      feed.scrollTo({
        top:
          cards[next].getBoundingClientRect().top -
          feedTop +
          feed.scrollTop,
        behavior: "smooth",
      });
    }

    function handleWheel(event: WheelEvent) {
      if (event.ctrlKey || event.deltaY === 0) return;

      event.preventDefault();

      const now = Date.now();

      if (now - wheelTime < 550) return;

      wheelTime = now;

      move(event.deltaY > 0 ? 1 : -1);
    }

    function handleKeyboard(event: KeyboardEvent) {
      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      ) return;

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (
          target.closest("input,textarea,select") ||
          target.isContentEditable
        )
      ) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        move(1);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        move(-1);
      }
    }

    function handleScroll() {
      if (!feed) return;

      const cards = Array.from(
        feed.querySelectorAll<HTMLElement>(
          "[data-discover-card]"
        )
      );

      if (cards.length === 0) {
        setActiveIndex(0);
        return;
      }

      const top = feed.getBoundingClientRect().top;

      const index = cards.reduce(
        (best, card, i) =>
          Math.abs(card.getBoundingClientRect().top - top) <
          Math.abs(cards[best].getBoundingClientRect().top - top)
            ? i
            : best,
        0
      );

      setActiveIndex(index);
    }

    feed.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    feed.addEventListener("scroll", handleScroll);

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    handleScroll();

    return () => {
      feed.removeEventListener("wheel", handleWheel);
      feed.removeEventListener("scroll", handleScroll);

      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [loading, category, savedOnly, filteredArticles.length, view, query]);

  function goTo(index: number) {
    const feed = feedRef.current;

    if (!feed) return;

    const cards =
      feed.querySelectorAll<HTMLElement>(
        "[data-discover-card]"
      );

    const next = Math.max(
      0,
      Math.min(cards.length - 1, index)
    );

    const card = cards[next];

    if (!card) return;

    feed.scrollTo({
      top:
        card.getBoundingClientRect().top -
        feed.getBoundingClientRect().top +
        feed.scrollTop,
      behavior: "smooth",
    });
  }

  return (
    <main
  className={`min-h-screen ${darkMode ? "tech-mode bg-[#0b0e0d] text-white" : "bg-[#f5f6f8] text-[#151515]"}`}
  style={{
    "--discover-accent": isTech ? "#288b5f" : "#d41c3d",
    "--discover-hover": isTech ? "#1d704b" : "#b80f32",
    "--discover-soft": isTech ? (darkMode ? "#20362a" : "#e6f5ed") : (darkMode ? "#391c24" : "#fff1f2"),
    "--discover-border": isTech ? (darkMode ? "#30343a" : "#cce8d8") : "#ffe4e6",
  } as import("react").CSSProperties}
>

      {true ? (
  <header className={`sticky top-0 z-50 border-b ${
    darkMode
      ? "border-[#30343a] bg-[#141915]"
      : "border-gray-200 bg-white"
  }`}>
    <div className="tempulli-container flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-4">

      <Link
        href={isTech ? "/subcategory/teknologji" : "/discover"}
        className="text-2xl font-black tracking-tight sm:text-3xl"
      >
        TEMPULLI <span className="text-[var(--discover-accent)]">{isTech ? "TECH" : "INFO"}</span>
      </Link>

      <div className="flex flex-wrap items-center gap-3">

        <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 p-1">

          {(["sq", "en"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={language === value}
              onClick={() => changeLanguage(value)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase transition ${
                language === value
                  ? "bg-[var(--discover-accent)] text-white"
                  : "text-gray-500"
              }`}
            >
              {value}
            </button>
          ))}

        </div>

        <button
          type="button"
          onClick={changeTheme}
          aria-label={t("Ndrysho pamjen", "Change theme")}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:text-[var(--discover-accent)]"
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          >
            {darkMode ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" />
              </>
            ) : (
              <path d="M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z" />
            )}
          </svg>
        </button>

        <Link
          href={isTech ? "/" : "/subcategory/teknologji"}
          className="rounded-xl border border-gray-200 px-4 py-3 text-xs font-extrabold transition hover:text-[var(--discover-accent)]"
        >
          {isTech ? "TEMPULLI INFO ↗" : "TEMPULLI TECH ↗"}
        </Link>

      </div>
    </div>
  </header>
) : (
  <Header />
)}

      <div className="tempulli-container py-5">

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--discover-accent)] text-white">
              <Icon name="discover" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight">
                {isTech ? "TEMPULLI TECH" : "Discover"}
              </h1>

              <p className="text-xs text-gray-500">
                {isTech ? t("Teknologji. Inteligjencë artificiale. Inovacion.", "Technology. Artificial intelligence. Innovation.") : t("Një mënyrë e re për të zbuluar lajmet.", "A new way to discover news.")}
              </p>
            </div>

          </div>

          <Link
            href="/"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold hover:text-[var(--discover-accent)]"
          >
            {t("← Ballina", "← Home")}
          </Link>

        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">

  <div className="flex gap-1 rounded-lg bg-gray-100 p-1">

    <button
      type="button"
      aria-pressed={view === "feed"}
      onClick={() => changeView("feed")}
      className={`flex flex-1 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-xs font-bold transition ${
        view === "feed"
          ? "bg-[var(--discover-accent)] text-white shadow-sm"
          : "text-gray-600 hover:bg-white"
      }`}
    >
      <Icon name="discover" />
      Feed
    </button>

    <button
      type="button"
      aria-pressed={view === "grid"}
      onClick={() => changeView("grid")}
      className={`flex flex-1 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-xs font-bold transition ${
        view === "grid"
          ? "bg-[var(--discover-accent)] text-white shadow-sm"
          : "text-gray-600 hover:bg-white"
      }`}
    >
      <Icon name="grid" />
      Grid
    </button>

  </div>

  <input
    type="search"
    aria-label="Kërko në Discover"
    placeholder={isTech ? t("Kërko në TEMPULLI TECH...", "Search TEMPULLI TECH...") : t("Kërko në Discover...", "Search Discover...")}
    value={query}
    onChange={(e) => {
      setQuery(e.target.value);
      setActiveIndex(0);
      pendingIndex.current = 0;
      if (feedRef.current) feedRef.current.scrollTop = 0;
    }}
    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[var(--discover-accent)] sm:max-w-[340px]"
  />

  {true && (
    <button
      type="button"
      disabled={loading}
      onClick={() => setRetry((value) => value + 1)}
      className="rounded-lg border border-gray-200 px-4 py-3 text-xs font-bold transition hover:text-[var(--discover-accent)] disabled:opacity-50"
    >
      {loading
        ? t("Duke ngarkuar...", "Loading...")
        : t("↻ Rifresko lajmet", "↻ Refresh news")}
    </button>
  )}
  <span className="text-xs font-semibold text-gray-400">
    {filteredArticles.length} {t("lajme", "articles")}
  </span>

</div>

{/* MOBILE CATEGORIES */}

        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">

          {categories.map((item) => (
            <button
              key={categoryLabel(item)}
              onClick={() => changeCategory(item)}
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold ${
                category === item && !savedOnly
                  ? "bg-[var(--discover-accent)] text-white"
                  : "border border-gray-200 bg-white text-gray-600"
              }`}
            >
              {categoryLabel(item)}
            </button>
          ))}

          <button
            onClick={openSaved}
            className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold ${
              savedOnly
                ? "bg-[var(--discover-accent)] text-white"
                : "border border-gray-200 bg-white text-gray-600"
            }`}
          >
            {t("Të ruajtura", "Saved")}
          </button>

        </div>

        <div className={`grid grid-cols-1 items-start gap-5 ${view === "feed" ? "lg:grid-cols-[230px_minmax(0,1fr)_85px] xl:grid-cols-[260px_minmax(0,1fr)_110px]" : "lg:grid-cols-[210px_minmax(0,1fr)] 2xl:grid-cols-[230px_minmax(0,1fr)_290px]"}`}>

          {/* LEFT SIDEBAR */}

          <aside className={`hidden rounded-xl border border-gray-200 bg-white p-4 lg:block ${"sticky top-24 max-h-[calc(100dvh-110px)] overflow-y-auto"}`}>

            <p className="mb-4 px-3 text-[10px] font-extrabold tracking-widest text-gray-400">
              DISCOVER
            </p>

            <button
              onClick={() => changeCategory("Të gjitha")}
              className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold ${
                !savedOnly
                  ? "bg-[var(--discover-soft)] text-[var(--discover-accent)]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon name="discover" />
              {t("Për ty", "For you")}
            </button>

            <button
              onClick={openSaved}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold ${
                savedOnly
                  ? "bg-[var(--discover-soft)] text-[var(--discover-accent)]"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon name="bookmark" />
              {t("Të ruajtura", "Saved")}

              <span className="ml-auto text-xs text-gray-400">
                {saved.length}
              </span>

            </button>

            <div className="my-5 border-t border-gray-100" />

            <p className="mb-3 px-3 text-[10px] font-extrabold tracking-widest text-gray-400">
              {t("KATEGORITË", "CATEGORIES")}
            </p>

            {categories.map((item) => (
              <button
                key={categoryLabel(item)}
                onClick={() => changeCategory(item)}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${
                  category === item && !savedOnly
                    ? "bg-[var(--discover-soft)] text-[var(--discover-accent)]"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >

                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background:
                      colors[item.toLowerCase()] || "#d41c3d",
                  }}
                />

                {categoryLabel(item)}

              </button>
            ))}

            <div className="mt-6 border-t border-gray-100 pt-5">

              <p className="text-[10px] font-black tracking-widest text-gray-400">
                TEMPULLI MEDIA
              </p>

              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                {t("Informohu. Zbulo. Lexo.", "Stay informed. Discover. Read.")}
              </p>

            </div>

          </aside>

          {/* DISCOVER FEED */}

          <div className={`mx-auto w-full min-w-0 ${view === "feed" ? "max-w-[650px]" : ""}`}>

            {loading ? (
              <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-gray-200 bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--discover-accent)]" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">

                <p className="text-sm font-bold text-gray-600">
                  {t("Lajmet nuk u ngarkuan.", "News could not be loaded.")}
                </p>

                <button
                  onClick={() => setRetry((value) => value + 1)}
                  className="mt-4 rounded-lg bg-[var(--discover-accent)] px-5 py-2 text-sm font-bold text-white"
                >
                  {t("Provo përsëri", "Try again")}
                </button>

              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                {savedOnly
                  ? t("Nuk ka lajme të ruajtura në këtë listë.", "No saved articles in this list.")
                  : t("Nuk ka lajme në këtë kategori.", "No articles in this category.")}
              </div>
            ) : view === "grid" ? (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:auto-rows-[300px]">
    {filteredArticles.map((article, index) => (
      <article
        key={article.id}
        className={`group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md ${index === 0 ? "sm:col-span-2 xl:row-span-2" : ""}`}
      >
        <button
          type="button"
          onClick={() => changeView("feed", index)}
          className="relative block w-full flex-1 min-h-0 text-left"
        >
          <div className={`relative overflow-hidden bg-[#15171b] ${true ? (index === 0 ? "h-[340px] sm:h-[550px]" : "h-[250px]") : "aspect-[4/3]"}`}>
            {article.image_url ? (
              <img
                src={article.image_url}
                alt={article.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-black text-white">
                TEMPULLI
              </div>
            )}

            <span
              className="absolute left-2 top-2 rounded px-2 py-1 text-[9px] font-bold uppercase text-white"
              style={{
                background: colors[(article.category || "").toLowerCase()] || "#d41c3d"
              }}
            >
              {(isTech ? article.subcategory : article.category) || "Lajme"}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-5 pb-5 pt-24 text-white">
            <p className="mb-2 text-[10px] text-gray-400">
              {timeAgo(article.created_at)}
            </p>
            <h2 className={`line-clamp-3 font-extrabold leading-snug transition group-hover:text-[var(--discover-accent)] ${true ? (index === 0 ? "text-2xl sm:text-3xl" : "text-lg") : "min-h-[60px] text-sm"}`}>
              {article.title}
            </h2>
          </div>
        </button>

        <div className="flex items-center gap-2 border-t border-gray-100 p-2">
          <button
            type="button"
            aria-label={t("Ruaj lajmin", "Save article")}
            aria-pressed={saved.includes(article.id)}
            onClick={() => toggleSaved(article.id)}
            className={`rounded-lg p-2 ${
              saved.includes(article.id)
                ? "bg-[var(--discover-soft)] text-[var(--discover-accent)]"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Icon name="bookmark" filled={saved.includes(article.id)} />
          </button>

          <button
            type="button"
            aria-label={t("Shpërndaj lajmin", "Share article")}
            onClick={() => shareArticle(article)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <Icon name="share" />
          </button>

          <Link
            href={`/article/${article.slug}`}
            className="ml-auto rounded-lg p-2 text-[var(--discover-accent)]"
            aria-label={t("Lexo artikullin", "Read article")}
          >
            <Icon name="arrow" />
          </Link>
        </div>
      </article>
    ))}
  </div>
) : (
  <div ref={feedRef}
                tabIndex={0}
                aria-label="Rrjedha e lajmeve Discover"
                className="h-[calc(100dvh-260px)] min-h-[340px] max-h-[760px] snap-y snap-mandatory overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:h-[calc(100dvh-240px)] lg:min-h-[400px]"
              >

                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    data-discover-card
                    className="flex h-full shrink-0 snap-start snap-always pb-3"
                  >

                    <article className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                      {/* ARTICLE IMAGE */}

                      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#e5e7eb]">

                        {article.image_url ? (
                          <img
                            src={article.image_url}
                            alt={article.title}
                            loading="lazy"
                            draggable={false}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[#15171b] text-3xl font-black tracking-tight text-white">
                            TEMPULLI
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />

                        <span
                          className="absolute left-4 top-4 rounded-md px-3 py-1.5 text-[10px] font-extrabold uppercase text-white"
                          style={{
                            background:
                              colors[
                                (article.category || "").toLowerCase()
                              ] || "#d41c3d",
                          }}
                        >
                          {(isTech ? article.subcategory : article.category) || "LAJME"}
                        </span>

                        <span className="absolute bottom-4 left-4 flex items-center gap-2 text-[9px] font-extrabold tracking-widest text-white">

                          <span className="h-2 w-2 rounded-full bg-[var(--discover-accent)]" />

                          {isTech ? "TEMPULLI TECH" : "TEMPULLI INFO"}
                        </span>

                      </div>

                      {/* ARTICLE CONTENT */}

                      <div className="shrink-0 p-4 sm:p-6">

                        <p className="mb-2 text-[11px] font-bold text-gray-400">
                          {timeAgo(article.created_at)}
                        </p>

                        <Link href={`/article/${article.slug}`}>

                          <h2 className="line-clamp-3 text-xl font-black leading-tight tracking-tight transition hover:text-[var(--discover-accent)] sm:text-2xl xl:text-[28px]">
                            {article.title}
                          </h2>

                        </Link>

                        {article.lead && (
                          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-500">
                            {article.lead}
                          </p>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              aria-label={t("Ruaj lajmin", "Save article")}
                              aria-pressed={saved.includes(article.id)}
                              onClick={() => toggleSaved(article.id)}
                              className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                                saved.includes(article.id)
                                  ? "border-[var(--discover-border)] bg-[var(--discover-soft)] text-[var(--discover-accent)]"
                                  : "border-gray-200 text-gray-600 hover:text-[var(--discover-accent)]"
                              }`}
                            >
                              <Icon
                                name="bookmark"
                                filled={saved.includes(article.id)}
                              />
                            </button>

                            <button
                              type="button"
                              aria-label={t("Shpërndaj lajmin", "Share article")}
                              onClick={() => shareArticle(article)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:text-[var(--discover-accent)]"
                            >
                              <Icon name="share" />
                            </button>

                          </div>

                          <Link
                            href={`/article/${article.slug}`}
                            className="flex items-center gap-2 rounded-lg bg-[var(--discover-accent)] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-[var(--discover-hover)]"
                          >
                            {t("Lexo artikullin", "Read article")}
                            <Icon name="arrow" />
                          </Link>

                        </div>

                      </div>

                    </article>

                  </div>
                ))}

              </div>
            )}

            <div className={`mt-2 items-center justify-center gap-2 text-[10px] font-semibold text-gray-400 ${view === "feed" ? "flex" : "hidden"}`}>

              <span>↕</span>
              {t("Rrëshqit për lajmin e radhës", "Scroll to the next article")}

            </div>

          </div>

          {view === "grid" && (
  <aside className="hidden space-y-5 2xl:block">

    <section className="rounded-xl border border-gray-200 bg-white p-5">

      <h2 className="mb-5 text-xs font-black uppercase tracking-widest text-[var(--discover-accent)]">
        // {t("Të fundit", "Latest news")}
      </h2>

      {articles.slice(0, 12).map((article) => (
        <Link
          key={article.id}
          href={`/article/${article.slug}`}
          className="block border-b border-gray-100 py-4 transition last:border-0 hover:text-[var(--discover-accent)]"
        >
          <p className="mb-2 text-[10px] font-bold uppercase text-[var(--discover-accent)]">
            {categoryLabel((isTech ? article.subcategory : article.category) || "Lajme")}
          </p>

          <h3 className="line-clamp-3 text-sm font-bold leading-snug">
            {article.title}
          </h3>

          <p className="mt-2 text-[10px] text-gray-400">
            {timeAgo(article.created_at)}
          </p>
        </Link>
      ))}

    </section>

  </aside>
)}

{/* RIGHT NAVIGATION */}

          <aside className={`flex-col items-center justify-center gap-5 self-center ${view === "feed" ? "hidden lg:flex" : "hidden"}`}>

            <button
              type="button"
              aria-label={t("Lajmi i mëparshëm", "Previous article")}
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0 || loading}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-[var(--discover-accent)] hover:text-[var(--discover-accent)] disabled:opacity-30"
            >
              <Icon name="up" />
            </button>

            <div className="text-center">

              <p className="text-xl font-black text-[var(--discover-accent)]">
                {String(
                  filteredArticles.length ? activeIndex + 1 : 0
                ).padStart(2, "0")}
              </p>

              <div className="my-2 h-px w-8 bg-gray-300" />

              <p className="text-xs font-bold text-gray-400">
                {String(
                  filteredArticles.length
                ).padStart(2, "0")}
              </p>

            </div>

            <button
              type="button"
              aria-label={t("Lajmi i radhës", "Next article")}
              onClick={() => goTo(activeIndex + 1)}
              disabled={
                loading ||
                activeIndex >= filteredArticles.length - 1
              }
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-[var(--discover-accent)] hover:text-[var(--discover-accent)] disabled:opacity-30"
            >
              <Icon name="down" />
            </button>

            <div className="mt-3 text-center text-[10px] leading-relaxed text-gray-400">
              Mouse Scroll
              <br />
              ↑ ↓
            </div>

          </aside>

        </div>

      </div>

      {/* NOTIFICATION */}

      {notice && (
        <div role="status" className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-[#15171b] px-6 py-3 text-center text-xs font-bold text-white shadow-xl">
          {notice}
        </div>
      )}

      {darkMode && (
        <style>{String.raw`
          .tech-mode .bg-white {
            background-color: #17191b;
          }

          .tech-mode .bg-gray-50,
          .tech-mode .bg-gray-100 {
            background-color: #202327;
          }

          .tech-mode .border-gray-100,
          .tech-mode .border-gray-200 {
            border-color: #30343a;
          }

          .tech-mode .text-gray-500,
          .tech-mode .text-gray-600,
          .tech-mode .text-gray-700 {
            color: #a7adb5;
          }

          .tech-mode .text-gray-400 {
            color: #9299a3;
          }

          .tech-mode .bg-gray-300 {
            background-color: #30343a;
          }

          .tech-mode .hover\:bg-white:hover,
          .tech-mode .hover\:bg-gray-50:hover,
          .tech-mode .hover\:bg-gray-100:hover {
            background-color: #282c32;
          }

          .tech-mode input {
            color: white;
            color-scheme: dark;
          }

          .tech-mode input::placeholder {
            color: #9299a3;
          }

          .tech-mode input[type="search"] {
            background-color: #17191b;
          }
        `}</style>
      )}
    </main>
  );
}






