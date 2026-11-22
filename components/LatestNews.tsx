
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  image_url?: string | null;
  created_at: string;
};

const POSTS_PER_PAGE = 12;

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

function timeAgo(date: string) {
  const timestamp = new Date(date).getTime();

  if (!Number.isFinite(timestamp)) return "";

  const minutes = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 60000)
  );

  if (minutes < 1) return "Sapo publikuar";
  if (minutes === 1) return "1 minutë më parë";
  if (minutes < 60) return `${minutes} minuta më parë`;

  const hours = Math.floor(minutes / 60);

  if (hours === 1) return "1 orë më parë";
  if (hours < 24) return `${hours} orë më parë`;

  const days = Math.floor(hours / 24);

  if (days === 1) return "1 ditë më parë";
  if (days < 7) return `${days} ditë më parë`;

  return new Date(date).toLocaleDateString("sq-AL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function LatestNews() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [visibleLimit, setVisibleLimit] =
    useState(POSTS_PER_PAGE);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function fetchPosts() {
      setLoading(true);
      setError(false);

      try {
        const { data, count, error } = await supabase
          .from("posts")
          .select(
            "id,title,slug,category,image_url,created_at",
            { count: "exact" }
          )
          .eq("status", "published")
          .or("is_featured.is.null,is_featured.eq.false")
          .or("is_sidebar.is.null,is_sidebar.eq.false")
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(0, visibleLimit - 1);

        if (!active) return;

        if (error) throw error;

        setPosts((data || []) as Post[]);
        setTotalPosts(count || 0);

      } catch (error) {
        if (!active) return;

        console.error(error);
        setError(true);

      } finally {
        if (active) setLoading(false);
      }
    }

    fetchPosts();

    return () => {
      active = false;
    };
  }, [visibleLimit, retry]);

  const hasMore = posts.length < totalPosts;

  return (
    <section className="w-full bg-white p-4 sm:p-5">

      {/* HEADER */}

      <div className="mb-5 flex items-center justify-between gap-3 border-b border-gray-200 pb-4">

        <div className="flex items-center gap-3">

          <span className="h-6 w-1 rounded-full bg-[#dc123c]" />

          <h2 className="text-xl font-extrabold tracking-tight text-[#151515]">
            Lajmet e fundit
          </h2>

        </div>

        <div className="hidden items-center gap-2 sm:flex">

          <span className="relative flex h-2 w-2">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#dc123c] opacity-50" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#dc123c]" />

          </span>

          <span className="text-[10px] font-bold tracking-wider text-gray-400">
            TEMPULLI INFO
          </span>

        </div>

      </div>

      {/* NEWS GRID */}

      <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">

        {/* LOADING SKELETON */}

        {loading && posts.length === 0 &&
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">

              <div className="aspect-video rounded-xl bg-gray-100" />

              <div className="mt-4 h-2.5 w-20 rounded bg-gray-100" />

              <div className="mt-3 h-4 w-full rounded bg-gray-100" />

              <div className="mt-2 h-4 w-3/4 rounded bg-gray-100" />

              <div className="mt-3 h-2.5 w-24 rounded bg-gray-100" />

            </div>
          ))}

        {/* ARTICLES */}

        {posts.map((post) => {
          const color = categoryColor(post.category);

          return (
            <Link
              key={post.id}
              href={`/article/${post.slug}`}
              className="group block min-w-0"
            >

              <article className="flex h-full flex-col">

                {/* IMAGE */}

                <div className="relative aspect-video overflow-hidden rounded-xl bg-[#f1f2f4]">

                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">

                      <span className="text-sm font-extrabold tracking-widest text-gray-300">
                        TEMPULLI
                      </span>

                    </div>
                  )}

                  <div className="absolute right-3 top-3 flex h-8 w-8 translate-x-2 items-center justify-center rounded-full bg-white/90 text-[#151515] opacity-0 shadow-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7" />
                      <path d="M7 7h10v10" />
                    </svg>

                  </div>

                </div>

                {/* CATEGORY */}

                <div
                  className="mb-2 mt-4 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide"
                  style={{ color }}
                >

                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />

                  {post.category}

                </div>

                {/* TITLE */}

                <h3 className="line-clamp-3 text-[16px] font-extrabold leading-snug tracking-tight text-[#151515] transition-colors group-hover:text-[#dc123c]">

                  {post.title}

                </h3>

                {/* PUBLICATION TIME */}

                <div className="mt-auto pt-3">

                  <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-4">

                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>

                      <time dateTime={post.created_at}>
                        {timeAgo(post.created_at)}
                      </time>

                    </div>

                    <span className="text-sm text-gray-400 transition-colors group-hover:text-[#dc123c]">
                      ↗
                    </span>

                  </div>

                </div>

              </article>

            </Link>
          );
        })}

      </div>

      {/* ERROR */}

      {!loading && error && (
        <div className="mt-6 rounded-lg bg-gray-50 p-5 text-center">

          <p className="mb-3 text-sm text-gray-500">
            Lajmet nuk mund të ngarkohen për momentin.
          </p>

          <button
            type="button"
            onClick={() => setRetry((prev) => prev + 1)}
            className="text-sm font-bold text-[#dc123c]"
          >
            Provo përsëri
          </button>

        </div>
      )}

      {/* EMPTY STATE */}

      {!loading && !error && posts.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-400">
          Nuk ka lajme për momentin.
        </p>
      )}

      {/* LOAD MORE */}

      {posts.length > 0 && hasMore && !error && (
        <div className="mt-8 flex flex-col items-center">

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              setVisibleLimit(
                (prev) => prev + POSTS_PER_PAGE
              )
            }
            className="flex w-full max-w-xs items-center justify-center gap-3 rounded-xl border border-gray-200 px-6 py-3.5 text-sm font-extrabold text-[#151515] transition-all hover:border-[#dc123c] hover:bg-red-50 hover:text-[#dc123c] disabled:cursor-wait disabled:opacity-50"
          >

            {loading
              ? "Duke ngarkuar..."
              : "Shfaq më shumë lajme"}

            {!loading && (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M12 5v14" />
                <path d="m6 13 6 6 6-6" />
              </svg>
            )}

          </button>

          <p className="mt-3 text-[11px] font-medium text-gray-400">
            Shfaqur {posts.length} nga {totalPosts} lajme
          </p>

        </div>
      )}

    </section>
  );
}
