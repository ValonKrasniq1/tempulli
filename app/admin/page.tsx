"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import LiveMonitor from "../../components/analytics/LiveMonitor";
import { supabase } from "../../lib/supabase";

type Post = {
  id: number;
  title: string;
  category: string;
  status: string;
  created_at: string;
};

type DashboardAnalytics = {
  total_page_views: number;
  unique_visitors: number;
  views_today: number;
  unique_visitors_today: number;
  views_without_visitor_id: number;
  top_page: string;
  top_page_views: number;
  total_articles: number;
  published: number;
  draft: number;
  archived: number;
  updated_at: string;
};

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-US").format(value);
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);

  const [analytics, setAnalytics] =
    useState<DashboardAnalytics | null>(null);

  const [billboards, setBillboards] =
    useState<number | null>(null);

  const [campaigns, setCampaigns] =
    useState<number | null>(null);

  const [breakingMode, setBreakingMode] =
    useState("—");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    setRefreshing(true);

    try {
      const [
        analyticsResult,
        postsResult,
        billboardResult,
        campaignResult,
        breakingResult,
      ] = await Promise.all([

        supabase.rpc("get_dashboard_analytics"),

        supabase
          .from("posts")
          .select("id, title, category, status, created_at")
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(6),

        supabase
          .from("billboard_ads")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
          .eq("is_archived", false),

        supabase
          .from("top_campaigns")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),

        supabase
          .from("breaking_settings")
          .select("mode")
          .limit(1)
          .maybeSingle(),

      ]);

      const errors: string[] = [];

      if (analyticsResult.error) {
        errors.push(
          "Analytics: " + analyticsResult.error.message
        );
      } else if (analyticsResult.data) {
        setAnalytics(
          analyticsResult.data as DashboardAnalytics
        );
      } else {
        errors.push("Analytics: Nuk ka përgjigje.");
      }

      if (postsResult.error) {
        errors.push(
          "Articles: " + postsResult.error.message
        );
      } else {
        setPosts(postsResult.data ?? []);
      }

      if (billboardResult.error) {
        setBillboards(null);

        errors.push(
          "Billboards: " + billboardResult.error.message
        );
      } else {
        setBillboards(billboardResult.count ?? 0);
      }

      if (campaignResult.error) {
        setCampaigns(null);

        errors.push(
          "Campaigns: " + campaignResult.error.message
        );
      } else {
        setCampaigns(campaignResult.count ?? 0);
      }

      if (breakingResult.error) {
        setBreakingMode("—");

        errors.push(
          "Breaking: " + breakingResult.error.message
        );
      } else {
        setBreakingMode(
          breakingResult.data?.mode ?? "—"
        );
      }

      setError(errors.join(" | "));

    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        "Dashboard nuk mund të përditësohet. Kontrollo lidhjen me databazën."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  const totalViews =
    analytics?.total_page_views ?? 0;

  const missingVisitorIds =
    analytics?.views_without_visitor_id ?? 0;

  const identifiedViews = Math.max(
    0,
    totalViews - missingVisitorIds
  );

  const dataCoverage =
    totalViews > 0
      ? (identifiedViews / totalViews) * 100
      : 0;

  const topPage =
    analytics?.top_page === "/"
      ? "Ballina"
      : analytics?.top_page ?? "—";

  const lastUpdated = analytics?.updated_at
    ? new Date(analytics.updated_at).toLocaleString(
        "sq-AL",
        {
          timeZone: "Europe/Belgrade",
          dateStyle: "medium",
          timeStyle: "medium",
        }
      )
    : "—";

  return (
    <div className="space-y-6 pb-10">

      {/* DASHBOARD HEADER */}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

        <div>

          <div className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500">
            TEMPULLI MANAGEMENT SYSTEM
          </div>

          <h1 className="text-3xl font-extrabold text-[#d41c3d] sm:text-4xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm font-medium text-gray-500">
            Menaxhimi i portalit, audiencës,
            përmbajtjes dhe reklamave.
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() => void fetchDashboard()}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-extrabold transition hover:bg-gray-50 disabled:opacity-50"
          >

            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={refreshing ? "animate-spin" : ""}
            >
              <path d="M20 11a8 8 0 1 0-2 6" />
              <path d="M20 4v7h-7" />
            </svg>

            {refreshing
              ? "Duke përditësuar..."
              : "Përditëso"}

          </button>

          <Link
            href="/admin/articles"
            className="rounded-xl bg-[#d41c3d] px-4 py-3 text-sm font-extrabold text-white transition hover:opacity-90"
          >
            + Shto lajm
          </Link>

          <Link
            href="/admin/breaking"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-extrabold hover:bg-gray-50"
          >
            ⚡ Breaking
          </Link>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-extrabold hover:bg-gray-50"
          >
            Shiko faqen ↗
          </Link>

        </div>

      </div>

      {/* ERROR HANDLING */}

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5"
        >

          <h3 className="font-extrabold text-amber-600">
            Disa statistika nuk u përditësuan
          </h3>

          <p className="mt-2 break-words text-sm text-gray-500">
            {error}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Rezultatet e mëparshme mund të jenë
            ende të dukshme.
          </p>

        </div>
      )}

      {/* ANALYTICS OVERVIEW */}

      <section>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

          <div>

            <h2 className="text-xl font-extrabold">
              Audience Overview
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Statistika të llogaritura direkt
              nga databaza.
            </p>

          </div>

          <span className="text-xs font-bold text-gray-500">
            {loading
              ? "Duke ngarkuar..."
              : `Përditësuar: ${lastUpdated}`}
          </span>

        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          <Card
            title="Total lajme"
            value={formatNumber(
              analytics?.total_articles
            )}
            label="Të gjithë artikujt"
            color="#d41c3d"
            icon="articles"
            loading={loading}
          />

          <Card
            title="Shikime totale"
            value={formatNumber(
              analytics?.total_page_views
            )}
            label="Page views · Gjithë periudha"
            color="#2563eb"
            icon="eye"
            loading={loading}
          />

          <Card
            title="Vizitorë unikë"
            value={formatNumber(
              analytics?.unique_visitors
            )}
            label="Identifikues unikë të shfletuesve"
            color="#9333ea"
            icon="users"
            loading={loading}
          />

          <Card
            title="Shikime sot"
            value={formatNumber(
              analytics?.views_today
            )}
            label="Nga ora 00:00 deri tani"
            color="#288b5f"
            icon="chart"
            loading={loading}
          />

          <Card
            title="Vizitorë unikë sot"
            value={formatNumber(
              analytics?.unique_visitors_today
            )}
            label="Identifikues unikë gjatë ditës"
            color="#0891b2"
            icon="user"
            loading={loading}
          />

          <Card
            title="Faqja më e vizituar"
            value={topPage}
            label={
              analytics
                ? `${formatNumber(
                    analytics.top_page_views
                  )} shikime`
                : "—"
            }
            color="#d97706"
            icon="globe"
            loading={loading}
            compact
          />

        </div>

      </section>

      {/* LIVE AUDIENCE */}

      <LiveMonitor />

      {/* DATA QUALITY */}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>

            <h2 className="text-xl font-extrabold">
              Data Quality
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Cilësia e të dhënave të regjistruara.
            </p>

          </div>

          <span className="rounded-full bg-gray-100 px-4 py-2 text-xs font-extrabold">
            Analytics integrity
          </span>

        </div>

        {analytics ? (

          <>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <QualityMetric
                title="Shikime të regjistruara"
                value={formatNumber(totalViews)}
              />

              <QualityMetric
                title="Shikime me Visitor ID"
                value={formatNumber(identifiedViews)}
              />

              <QualityMetric
                title="Shikime pa Visitor ID"
                value={formatNumber(missingVisitorIds)}
              />

              <QualityMetric
                title="Mbulueshmëria e identifikimit"
                value={
                  totalViews > 0
                    ? `${dataCoverage.toFixed(1)}%`
                    : "—"
                }
              />

            </div>

            <div className="mt-6">

              <div className="mb-2 flex justify-between gap-3 text-xs font-bold">

                <span className="text-[#288b5f]">
                  Me Visitor ID
                </span>

                <span className="text-amber-600">
                  Pa Visitor ID
                </span>

              </div>

              <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="bg-[#288b5f] transition-all duration-500"
                  style={{
                    width: `${dataCoverage}%`,
                  }}
                />

                <div
                  className="bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${
                      totalViews > 0
                        ? 100 - dataCoverage
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

            {missingVisitorIds > 0 && (

              <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">

                <p className="text-sm font-extrabold text-amber-600">
                  Disa shikime nuk kanë identifikues
                </p>

                <p className="mt-2 text-xs leading-relaxed text-gray-500">

                  {formatNumber(missingVisitorIds)} shikime
                  janë regjistruar pa Visitor ID.
                  Ato përfshihen në totalin e shikimeve,
                  por nuk mund të përdoren për të
                  përcaktuar numrin e vizitorëve unikë.

                  Nuk do të fshihen apo ndryshohen
                  statistikat historike.

                </p>

              </div>

            )}

          </>

        ) : (

          <p className="mt-5 text-sm text-gray-500">
            {loading
              ? "Duke analizuar të dhënat..."
              : "Statistikat nuk janë të disponueshme."}
          </p>

        )}

        <p className="mt-5 text-xs leading-relaxed text-gray-500">

          Shikimet përfaqësojnë hapjet e regjistruara
          të faqeve. Vizitorët unikë përfaqësojnë
          identifikues të shfletuesve dhe jo
          domosdoshmërisht persona të ndryshëm.
          Bllokuesit e reklamave, kufizimet e
          shfletuesve dhe trafiku automatik
          mund të ndikojnë në statistika.

        </p>

      </section>

      {/* CONTENT MANAGEMENT */}

      <div className="grid items-start gap-6 xl:grid-cols-3">

        {/* LATEST ARTICLES */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white xl:col-span-2">

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-5 sm:p-6">

            <div>

              <h2 className="text-xl font-extrabold">
                Lajmet e fundit
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Përmbajtja e fundit e shtuar në portal.
              </p>

            </div>

            <Link
              href="/admin/articles"
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-extrabold hover:bg-gray-50"
            >
              Të gjithë artikujt →
            </Link>

          </div>

          {loading ? (

            <div className="p-10 text-center text-sm text-gray-500">
              Duke ngarkuar lajmet...
            </div>

          ) : posts.length === 0 ? (

            <div className="p-10 text-center text-sm text-gray-500">
              Nuk ka artikuj për t'u shfaqur.
            </div>

          ) : (

            <div className="divide-y divide-gray-200">

              {posts.map((post) => (

                <div
                  key={post.id}
                  className="flex items-center justify-between gap-4 p-5 transition hover:bg-gray-50"
                >

                  <div className="min-w-0 flex-1">

                    <h3 className="line-clamp-2 text-sm font-extrabold sm:text-base">
                      {post.title}
                    </h3>

                    <p className="mt-2 text-xs text-gray-500">

                      {post.category || "Pa kategori"}

                      {" • "}

                      {new Date(
                        post.created_at
                      ).toLocaleDateString("sq-AL", {
                        timeZone: "Europe/Belgrade",
                      })}

                    </p>

                  </div>

                  <StatusBadge status={post.status} />

                </div>

              ))}

            </div>

          )}

        </section>

        {/* RIGHT SIDEBAR */}

        <aside className="space-y-6">

          {/* CONTENT STATISTICS */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

            <h2 className="text-xl font-extrabold">
              Content Statistics
            </h2>

            <div className="mt-5">

              <Stat
                label="Publikuar"
                value={formatNumber(
                  analytics?.published
                )}
                color="#288b5f"
              />

              <Stat
                label="Draft"
                value={formatNumber(
                  analytics?.draft
                )}
                color="#d97706"
              />

              <Stat
                label="Arkivuar"
                value={formatNumber(
                  analytics?.archived
                )}
                color="#6b7280"
              />

              <Stat
                label="Total artikuj"
                value={formatNumber(
                  analytics?.total_articles
                )}
              />

            </div>

          </section>

          {/* MODULE STATUS */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

            <h2 className="text-xl font-extrabold">
              Module Status
            </h2>

            <div className="mt-5">

              <div className="flex items-center justify-between gap-3 border-b border-gray-200 py-3">

                <span className="text-sm font-semibold text-gray-500">
                  Breaking News
                </span>

                <span
                  className="rounded-full px-3 py-1 text-xs font-extrabold"
                  style={{
                    color:
                      breakingMode === "off"
                        ? "#9ca3af"
                        : breakingMode === "—"
                          ? "#d97706"
                          : "#288b5f",
                    backgroundColor:
                      breakingMode === "off"
                        ? "#80808015"
                        : breakingMode === "—"
                          ? "#d9770615"
                          : "#288b5f15",
                  }}
                >

                  {breakingMode.toUpperCase()}

                </span>

              </div>

              <Stat
                label="Billboards aktive"
                value={formatNumber(billboards)}
                color="#2563eb"
              />

              <Stat
                label="Campaigns aktive"
                value={formatNumber(campaigns)}
                color="#9333ea"
              />

            </div>

          </section>

          {/* QUICK ACTIONS */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

            <h2 className="mb-5 text-xl font-extrabold">
              Veprime të shpejta
            </h2>

            <div className="grid gap-3">

              <Quick
                href="/admin/articles"
                text="Articles"
                icon="articles"
              />

              <Quick
                href="/admin/breaking"
                text="Breaking News"
                icon="bolt"
              />

              <Quick
                href="/admin/live"
                text="LIVE Updates"
                icon="activity"
              />

              <Quick
                href="/admin/advertising"
                text="Advertising"
                icon="advertising"
              />

              <Quick
                href="/admin/video-stories"
                text="Video Stories"
                icon="video"
              />

            </div>

          </section>

        </aside>

      </div>

      {/* SYSTEM FOOTER */}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5 text-xs text-gray-500">

        <span className="font-extrabold tracking-wider">
          TEMPULLI CMS 2.0
        </span>

        <span>
          Marketing · Content · Analytics
        </span>

      </footer>

    </div>
  );
}

/* STATISTIC CARD */

function Card({
  title,
  value,
  label,
  color,
  icon,
  loading,
  compact = false,
}: {
  title: string;
  value: string | number;
  label: string;
  color: string;
  icon: string;
  loading: boolean;
  compact?: boolean;
}) {

  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">

      <div className="flex items-center justify-between gap-3">

        <p className="text-sm font-bold text-gray-500">
          {title}
        </p>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: `${color}15`,
            color,
          }}
        >
          <Icon name={icon} />
        </div>

      </div>

      {loading ? (

        <div className="my-4 h-10 w-32 animate-pulse rounded-lg bg-gray-100" />

      ) : (

        <h3
          title={String(value)}
          className={`my-3 font-extrabold tabular-nums ${
            compact
              ? "break-words text-xl sm:text-2xl"
              : "text-4xl"
          }`}
        >
          {value}
        </h3>

      )}

      <p
        className="text-xs font-bold"
        style={{ color }}
      >
        {label}
      </p>

    </div>
  );
}

/* DATA QUALITY METRIC */

function QualityMetric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (
    <div className="rounded-xl border border-gray-200 p-4">

      <p className="text-xs font-semibold text-gray-500">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-extrabold tabular-nums">
        {value}
      </h3>

    </div>
  );
}

/* ARTICLE STATUS */

function StatusBadge({
  status,
}: {
  status: string;
}) {

  const config: Record<
    string,
    { label: string; color: string }
  > = {

    published: {
      label: "Publikuar",
      color: "#288b5f",
    },

    draft: {
      label: "Draft",
      color: "#d97706",
    },

    archived: {
      label: "Arkivuar",
      color: "#6b7280",
    },

  };

  const item = config[status] || {
    label: status || "—",
    color: "#6b7280",
  };

  return (
    <span
      className="shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold"
      style={{
        backgroundColor: `${item.color}15`,
        color: item.color,
      }}
    >
      {item.label}
    </span>
  );
}

/* SIDEBAR STATISTIC */

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {

  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-200 py-3 last:border-0">

      <span className="text-sm font-semibold text-gray-500">
        {label}
      </span>

      <span
        className="text-sm font-extrabold tabular-nums"
        style={color ? { color } : undefined}
      >
        {value}
      </span>

    </div>
  );
}

/* QUICK ACTION */

function Quick({
  href,
  text,
  icon,
}: {
  href: string;
  text: string;
  icon: string;
}) {

  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-extrabold transition hover:border-[#d41c3d] hover:text-[#d41c3d]"
    >

      <div className="flex items-center gap-3">

        <span className="text-gray-500 group-hover:text-[#d41c3d]">
          <Icon name={icon} />
        </span>

        {text}

      </div>

      <span className="text-gray-400 group-hover:text-[#d41c3d]">
        →
      </span>

    </Link>
  );
}

/* SVG ICON SYSTEM */

function Icon({
  name,
}: {
  name: string;
}) {

  const paths: Record<string, React.ReactNode> = {

    articles: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),

    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),

    users: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3" />
        <path d="M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2" />
      </>
    ),

    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),

    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m7 15 4-4 4 2 6-7" />
        <path d="M16 6h5v5" />
      </>
    ),

    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </>
    ),

    bolt: (
      <path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z" />
    ),

    activity: (
      <path d="M2 12h5l3-8 4 16 3-8h5" />
    ),

    advertising: (
      <>
        <path d="m3 10 15-6v16L3 14v-4Z" />
        <path d="m7 16 2 5h4l-2-4M21 8v8" />
      </>
    ),

    video: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m10 9 5 3-5 3V9Z" />
      </>
    ),

  };

  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || (
        <circle cx="12" cy="12" r="9" />
      )}
    </svg>
  );
}