
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  total_views: number;
};

const periods = [
  { label: "7 ditë", value: 7 },
  { label: "15 ditë", value: 15 },
  { label: "30 ditë", value: 30 },
];

function categoryColor(category: string) {
  const value = category.toLowerCase();

  if (value.includes("tech")) return "#11723d";
  if (value.includes("sport")) return "#2563eb";
  if (value.includes("ekonomi")) return "#b7791f";
  if (value.includes("kultur")) return "#9333ea";
  if (value.includes("magazina")) return "#9333ea";
  if (value.includes("fun")) return "#ea580c";

  return "#dc123c";
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function MostRead() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError(false);

      try {
        const { data, error } = await supabase.rpc(
          "get_most_read_articles",
          { period_days: period }
        );

        if (!active) return;
        if (error) throw error;

        setPosts(
          (data || []).map((post: Post) => ({
            ...post,
            total_views: Number(post.total_views),
          }))
        );
      } catch (error) {
        if (!active) return;

        console.error(error);
        setPosts([]);
        setError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPosts();

    return () => {
      active = false;
    };
  }, [period]);

  return (
    <section className="w-full bg-white p-3">

      {/* HEADER */}

      <div className="mb-5 flex items-center gap-2.5">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#dc123c] text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="m3 17 6-6 4 4 8-8" />
            <path d="M15 7h6v6" />
          </svg>
        </div>

        <h2 className="text-[18px] font-extrabold leading-tight tracking-tight text-[#151515]">
          Në fokus të lexuesve
        </h2>

      </div>

      {/* PERIOD FILTER */}

      <div className="mb-5 grid grid-cols-3 gap-1 rounded-lg bg-[#f3f4f6] p-1">

        {periods.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={period === item.value}
            onClick={() => setPeriod(item.value)}
            className={`rounded-md px-1 py-2 text-[11px] font-bold transition ${
              period === item.value
                ? "bg-white text-[#dc123c] shadow-sm"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {item.label}
          </button>
        ))}

      </div>

      {/* LOADING */}

      {loading && (
        <div className="space-y-4">

          <div className="h-44 animate-pulse rounded-xl bg-gray-100" />

          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse gap-3 border-b border-gray-100 py-4"
            >
              <div className="h-7 w-7 rounded bg-gray-100" />

              <div className="flex-1 space-y-2">
                <div className="h-2 w-16 rounded bg-gray-100" />
                <div className="h-4 w-full rounded bg-gray-100" />
                <div className="h-4 w-3/4 rounded bg-gray-100" />
              </div>

            </div>
          ))}

        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <p className="py-6 text-center text-xs text-gray-500">
          Statistikat nuk mund të ngarkohen për momentin.
        </p>
      )}

      {/* EMPTY STATE */}

      {!loading && !error && posts.length === 0 && (
        <p className="py-6 text-center text-xs text-gray-400">
          Nuk ka lexime të regjistruara për këtë periudhë.
        </p>
      )}

      {/* ARTICLES */}

      {!loading && !error && posts.length > 0 && (
        <div>

          {posts.map((post, index) => {
            const color = categoryColor(post.category);

            const views = post.total_views.toLocaleString("sq-AL");

            const viewLabel =
              post.total_views === 1 ? "lexim" : "lexime";

            {/* FIRST ARTICLE */}

            if (index === 0) {
              return (
                <Link
                  key={post.id}
                  href={`/article/${post.slug}`}
                  className="group mb-2 block overflow-hidden rounded-xl bg-[#15171b] p-4 transition hover:bg-[#22252b]"
                >

                  <div className="mb-4 flex items-center justify-between gap-2">

                    <span className="text-[38px] font-extrabold leading-none tracking-tight text-[#ff4058]">
                      01
                    </span>

                    <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-white">

                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />

                      {post.category}

                    </span>

                  </div>

                  <h3 className="line-clamp-3 text-[17px] font-extrabold leading-snug text-white transition group-hover:text-gray-200">
                    {post.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between">

                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                      <EyeIcon />

                      <span>
                        {views} {viewLabel}
                      </span>
                    </div>

                    <span className="text-lg text-gray-400 transition group-hover:text-white">
                      ↗
                    </span>

                  </div>

                </Link>
              );
            }

            {/* ARTICLES 02 - 07 */}

            return (
              <Link
                key={post.id}
                href={`/article/${post.slug}`}
                className="group block border-b border-gray-100 py-5 last:border-b-0"
              >

                <article className="flex items-start gap-3">

                  {/* ORIGINAL NUMBERS */}

                  <span className="w-7 shrink-0 text-xl font-extrabold tracking-tight text-gray-300 transition group-hover:text-[#dc123c]">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">

                    {/* CATEGORY */}

                    <div
                      className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide"
                      style={{ color }}
                    >

                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />

                      {post.category}

                    </div>

                    {/* TITLE */}

                    <h3 className="line-clamp-2 text-[14px] font-extrabold leading-snug text-[#151515] transition group-hover:text-[#dc123c]">
                      {post.title}
                    </h3>

                    {/* VIEWS */}

                    <div className="mt-2.5 flex items-center justify-between">

                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">

                        <EyeIcon />

                        <span>
                          {views} {viewLabel}
                        </span>

                      </div>

                      <span className="text-sm text-gray-400 transition group-hover:text-[#dc123c]">
                        ↗
                      </span>

                    </div>

                  </div>

                </article>

              </Link>
            );
          })}

        </div>
      )}

      {/* FOOTER */}

      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-4">

        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#dc123c]" />

          <span className="text-[10px] font-bold tracking-widest text-gray-400">
            TEMPULLI INFO
          </span>
        </div>

        <span className="text-[9px] text-gray-400">
          {period} ditët e fundit
        </span>

      </div>

    </section>
  );
}
