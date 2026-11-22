"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  image_url?: string | null;
  created_at?: string;
};

function categoryColor(category: string) {
  const value = category.toLowerCase();

  if (value.includes("tech")) return "#11723d";
  if (value.includes("sport")) return "#2563eb";
  if (value.includes("ekonomi")) return "#b7791f";
  if (value.includes("kultur")) return "#9333ea";

  return "#dc123c";
}

export default function Hero() {
  const [featured, setFeatured] = useState<Post | null>(null);
  const [sideNews, setSideNews] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHeroNews() {
      setLoading(true);

      try {
        const [featuredResult, sidebarResult] = await Promise.all([
          supabase
            .from("posts")
            .select("*")
            .eq("status", "published")
            .eq("is_featured", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),

          supabase
            .from("posts")
            .select("*")
            .eq("status", "published")
            .eq("is_sidebar", true)
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

        if (featuredResult.error) {
          console.error(featuredResult.error);
        }

        if (sidebarResult.error) {
          console.error(sidebarResult.error);
        }

        setFeatured((featuredResult.data as Post) || null);
        setSideNews((sidebarResult.data as Post[]) || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchHeroNews();
  }, []);

  if (!loading && !featured && sideNews.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white p-4 sm:p-5">

      {/* SECTION HEADER */}

      <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">

          <span className="h-6 w-1 rounded-full bg-[#dc123c]" />

          <h2 className="text-xl font-black tracking-tight text-black">
            Kryesore
          </h2>

        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#dc123c]" />

          <span className="text-[10px] font-bold tracking-wider text-gray-500">
            TEMPULLI INFO
          </span>
        </div>
      </div>

      {/* HERO GRID */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">

        {/* MAIN FEATURED ARTICLE */}

        <div className="min-w-0">

          {loading ? (
            <div className="aspect-[4/3] animate-pulse rounded-xl bg-gray-100" />
          ) : featured ? (

            <Link
              href={`/article/${featured.slug}`}
              className="group block"
            >

              <article>

                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">

                  {featured.image_url && (
                    <img
                      src={featured.image_url}
                      alt={featured.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  <div className="absolute left-3 top-3 rounded-md bg-[#dc123c] px-3 py-1.5 text-[10px] font-bold tracking-wide text-white">
                    LAJMI KRYESOR
                  </div>

                </div>

                <div className="pt-4">

                  <p
                    className="mb-2 text-[11px] font-extrabold uppercase tracking-wide"
                    style={{ color: categoryColor(featured.category) }}
                  >
                    {featured.category}
                  </p>

                  <h2 className="text-[25px] font-black leading-[1.15] tracking-tight text-[#151515] transition group-hover:text-[#dc123c] sm:text-[30px]">
                    {featured.title}
                  </h2>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">

                    <span className="text-[10px] font-bold tracking-widest text-gray-400">
                      TEMPULLI INFO
                    </span>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-lg transition group-hover:border-[#dc123c] group-hover:bg-[#dc123c] group-hover:text-white">
                      ↗
                    </span>

                  </div>

                </div>

              </article>

            </Link>

          ) : (
            <p className="py-8 text-sm text-gray-500">
              Nuk ka lajm kryesor të përzgjedhur.
            </p>
          )}

        </div>

        {/* SELECTED ARTICLES */}

        <div className="flex min-w-0 flex-col gap-4 sm:grid sm:grid-cols-3 xl:flex xl:border-l xl:border-gray-100 xl:pl-4">

          {loading ? (

            [1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-lg bg-gray-100"
              />
            ))

          ) : (

            sideNews.map((post) => (

              <Link
                href={`/article/${post.slug}`}
                key={post.id}
                className="group block border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
              >

                <article className="flex gap-3 sm:flex-col xl:flex-row">

                  <div className="aspect-[4/3] w-[110px] shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:w-full xl:w-[96px] 2xl:w-[120px]">

                    {post.image_url && (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <p
                      className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide"
                      style={{ color: categoryColor(post.category) }}
                    >
                      {post.category}
                    </p>

                    <h3 className="line-clamp-3 text-[14px] font-extrabold leading-snug text-[#151515] transition group-hover:text-[#dc123c]">
                      {post.title}
                    </h3>

                    <div className="mt-2 flex items-center justify-between">

                      <span className="text-[10px] text-gray-400">
                        Lajm i zgjedhur
                      </span>

                      <span className="text-sm text-gray-400 group-hover:text-[#dc123c]">
                        ↗
                      </span>

                    </div>

                  </div>

                </article>

              </Link>

            ))

          )}

        </div>

      </div>

    </section>
  );
}
