"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type ActivePage = {
  path: string;
  title: string;
  platform: "info" | "tech";
  visitors: number;
};

type LiveAnalytics = {
  online_total: number;
  reading_articles: number;
  browsing_pages: number;
  info_online: number;
  tech_online: number;
  mobile: number;
  desktop: number;
  tablet: number;
  unknown_device: number;
  active_pages: ActivePage[];
  active_articles: ActivePage[];
  updated_at: string;
};

export default function LiveMonitor() {
  const [data, setData] =
    useState<LiveAnalytics | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] =
    useState<"all" | "articles">("all");

  useEffect(() => {
    let cancelled = false;
    let running = false;

    async function fetchLive() {
      if (cancelled || running) return;

      if (document.visibilityState !== "visible") {
        return;
      }

      running = true;

      try {
        const { data: result, error: rpcError } =
          await supabase.rpc("get_live_analytics");

        if (cancelled) return;

        if (rpcError || !result) {
          setError(
            rpcError?.message ||
            "Nuk ka përgjigje nga databaza."
          );
          return;
        }

        setData(result as LiveAnalytics);
        setError("");

      } catch {
        if (!cancelled) {
          setError("Lidhja me databazën dështoi.");
        }
      } finally {
        running = false;

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchLive();

    const timer = window.setInterval(
      fetchLive,
      10_000
    );

    document.addEventListener(
      "visibilitychange",
      fetchLive
    );

    return () => {
      cancelled = true;
      window.clearInterval(timer);

      document.removeEventListener(
        "visibilitychange",
        fetchLive
      );
    };
  }, []);

  const total = data?.online_total ?? 0;

  const pages =
    filter === "articles"
      ? data?.active_articles ?? []
      : data?.active_pages ?? [];

  const devices = [
    {
      label: "Mobile",
      value: data?.mobile ?? 0,
    },
    {
      label: "Desktop",
      value: data?.desktop ?? 0,
    },
    {
      label: "Tablet",
      value: data?.tablet ?? 0,
    },
    {
      label: "Të tjera",
      value: data?.unknown_device ?? 0,
    },
  ];

  function percent(value: number) {
    return total > 0
      ? Math.min(100, (value / total) * 100)
      : 0;
  }

  function number(value: number) {
    return new Intl.NumberFormat("sq-AL")
      .format(value);
  }

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h2 className="text-2xl font-extrabold">
            Live Audience
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Aktiviteti aktual në TEMPULLI INFO & TECH
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2">

          <span
            className={`h-2.5 w-2.5 rounded-full ${
              error
                ? "bg-amber-500"
                : loading
                  ? "bg-gray-400"
                  : "animate-pulse bg-green-500"
            }`}
          />

          <span className="text-xs font-extrabold">
            {error
              ? "OFFLINE"
              : loading
                ? "CONNECTING"
                : "LIVE"}
          </span>

        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-500 p-4 text-sm"
        >
          Monitorimi nuk mund të përditësohet.

          <p className="mt-1 text-gray-500">
            {error}
          </p>

          {data && (
            <p className="mt-2 font-bold">
              Po shfaqen rezultatet e fundit të
              disponueshme, jo aktiviteti aktual.
            </p>
          )}
        </div>
      )}

      {loading && !data && (
        <div className="py-12 text-center text-sm text-gray-500">
          Duke ngarkuar aktivitetin LIVE...
        </div>
      )}

      {data && (
        <>

          {/* ONLINE OVERVIEW */}

          <div className="grid gap-4 lg:grid-cols-3">

            <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6">

              <p className="text-sm font-bold text-gray-500">
                Vizitorë aktivë
              </p>

              <div className="my-3 flex items-center gap-4">

                <span className="text-5xl font-extrabold tabular-nums text-[#288b5f]">
                  {number(total)}
                </span>

                <span className="relative flex h-3 w-3">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-50" />

                  <span className="relative h-3 w-3 rounded-full bg-green-500" />

                </span>

              </div>

              <p className="text-xs text-gray-500">
                Sinjal aktiviteti brenda 90 sekondave
              </p>

            </div>

            <Metric
              title="Në artikuj"
              value={data.reading_articles}
              label="Vizitorë me artikuj të hapur"
            />

            <Metric
              title="Në faqe të tjera"
              value={data.browsing_pages}
              label="Ballina, kategori, Discover"
            />

          </div>

          {/* BRAND AND DEVICE STATISTICS */}

          <div className="grid gap-4 xl:grid-cols-2">

            <div className="rounded-2xl border border-gray-200 p-5">

              <h3 className="mb-5 text-lg font-extrabold">
                Audienca sipas platformës
              </h3>

              <div className="space-y-6">

                <Progress
                  label="TEMPULLI INFO"
                  value={data.info_online}
                  percent={percent(data.info_online)}
                  color="#d41c3d"
                />

                <Progress
                  label="TEMPULLI TECH"
                  value={data.tech_online}
                  percent={percent(data.tech_online)}
                  color="#288b5f"
                />

              </div>

            </div>

            <div className="rounded-2xl border border-gray-200 p-5">

              <h3 className="mb-5 text-lg font-extrabold">
                Pajisjet aktive
              </h3>

              <div className="space-y-4">

                {devices.map((device) => (
                  <Progress
                    key={device.label}
                    label={device.label}
                    value={device.value}
                    percent={percent(device.value)}
                    color="#288b5f"
                  />
                ))}

              </div>

            </div>

          </div>

          {/* ACTIVE PAGES */}

          <div className="overflow-hidden rounded-2xl border border-gray-200">

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-5">

              <div>
                <h3 className="text-lg font-extrabold">
                  Ku ndodhen vizitorët?
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Faqet dhe artikujt aktivë
                </p>
              </div>

              <div className="flex rounded-lg bg-gray-100 p-1">

                <button
                  type="button"
                  onClick={() => setFilter("all")}
                  className={`rounded-md px-3 py-2 text-xs font-bold ${
                    filter === "all"
                      ? "bg-[#d41c3d] text-white"
                      : "text-gray-500"
                  }`}
                >
                  Të gjitha
                </button>

                <button
                  type="button"
                  onClick={() => setFilter("articles")}
                  className={`rounded-md px-3 py-2 text-xs font-bold ${
                    filter === "articles"
                      ? "bg-[#d41c3d] text-white"
                      : "text-gray-500"
                  }`}
                >
                  Artikujt
                </button>

              </div>

            </div>

            {pages.length === 0 ? (

              <div className="p-12 text-center">

                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">

                  <span className="text-2xl">◎</span>

                </div>

                <p className="font-extrabold">
                  Nuk ka aktivitet të regjistruar
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Vizitorët aktivë do të shfaqen këtu
                  sapo sistemi të marrë sinjale të reja.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[550px] text-left">

                  <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">

                    <tr>
                      <th className="p-4">Faqja / Artikulli</th>
                      <th className="p-4">Platforma</th>
                      <th className="p-4 text-right">Online</th>
                      <th className="p-4 text-right">Pjesëmarrja</th>
                    </tr>

                  </thead>

                  <tbody>

                    {pages.map((page) => (

                      <tr
                        key={`${page.platform}-${page.path}`}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >

                        <td className="p-4">

                          {/^\/(?!\/)[^\\]*$/.test(page.path) ? (

                            <Link
                              href={page.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold hover:text-[#d41c3d]"
                            >
                              {page.title || page.path} ↗
                            </Link>

                          ) : (

                            <span className="font-bold">
                              {page.title || page.path}
                            </span>

                          )}

                          <p className="mt-1 max-w-[350px] truncate text-xs text-gray-500">
                            {page.path}
                          </p>

                        </td>

                        <td className="p-4">

                          <span
                            className="text-xs font-extrabold"
                            style={{
                              color:
                                page.platform === "tech"
                                  ? "#288b5f"
                                  : "#d41c3d",
                            }}
                          >
                            {page.platform.toUpperCase()}
                          </span>

                        </td>

                        <td className="p-4 text-right">

                          <span className="font-extrabold tabular-nums text-[#288b5f]">
                            {number(page.visitors)}
                          </span>

                        </td>

                        <td className="p-4 text-right text-sm tabular-nums text-gray-500">

                          {percent(page.visitors).toFixed(1)}%

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

          {/* SYSTEM INFORMATION */}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-4 text-xs text-gray-500">

            <span>
              Përditësim automatik çdo 10 sekonda
            </span>

            <span>
              Sinjali i fundit i sistemit:{" "}
              {new Date(data.updated_at).toLocaleTimeString(
                "sq-AL",
                {
                  timeZone: "Europe/Belgrade",
                }
              )}
            </span>

          </div>

          <p className="text-xs leading-relaxed text-gray-500">
            Aktiviteti matet sipas sinjaleve të fundit
            nga shfletuesit. Një identifikues numërohet
            vetëm një herë, pavarësisht numrit të
            skedave. Aktiviteti nuk garanton që
            vizitori po lexon fizikisht artikullin.
          </p>

        </>
      )}

    </section>
  );
}

function Metric({
  title,
  value,
  label,
}: {
  title: string;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-6">

      <p className="text-sm font-bold text-gray-500">
        {title}
      </p>

      <h3 className="my-3 text-4xl font-extrabold tabular-nums">
        {value.toLocaleString("sq-AL")}
      </h3>

      <p className="text-xs text-gray-500">
        {label}
      </p>

    </div>
  );
}

function Progress({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
}) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between gap-4 text-sm">

        <span
          className="font-bold"
          style={{ color }}
        >
          {label}
        </span>

        <span className="font-bold tabular-nums">

          {value}

          <span className="ml-2 text-xs text-gray-500">
            ({percent.toFixed(1)}%)
          </span>

        </span>

      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded-full bg-gray-100"
      >

        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />

      </div>

    </div>
  );
}