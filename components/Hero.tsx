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

export default function Hero() {
  const [featured, setFeatured] = useState<Post | null>(null);
  const [sideNews, setSideNews] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHeroNews() {
      setLoading(true);

      const { data: featuredData } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: sidebarData } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .eq("is_sidebar", true)
        .order("created_at", { ascending: false })
        .limit(3);

      setFeatured((featuredData as Post) || null);
      setSideNews((sidebarData as Post[]) || []);
      setLoading(false);
    }

    fetchHeroNews();
  }, []);

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 pt-0 pb-5 lg:grid-cols-3 lg:gap-6 lg:pb-6">
      <div className="lg:col-span-2">
        {loading ? (
          <div className="h-[250px] animate-pulse rounded-xl bg-gray-100 sm:h-[330px] lg:h-[420px]" />
        ) : featured ? (
          <Link href={`/article/${featured.slug}`}>
            <div className="relative h-[250px] cursor-pointer overflow-hidden rounded-xl bg-black transition hover:opacity-95 sm:h-[330px] lg:h-[420px]">
              {featured.image_url && (
                <img
                  src={featured.image_url}
                  alt={featured.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />

              <div className="absolute bottom-0 p-4 text-white sm:p-5 md:p-8">
                <span className="mb-2 inline-block rounded-md bg-[#d41c3d] px-3 py-1 text-[10px] font-bold uppercase tracking-wide sm:mb-3 sm:text-xs">
                  LAJMI KRYESOR
                </span>

                <h2 className="max-w-2xl text-xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                  {featured.title}
                </h2>
              </div>
            </div>
          </Link>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 lg:h-[420px] lg:justify-between">
        {loading ? (
          <>
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </>
        ) : (
          sideNews.map((post) => (
            <Link href={`/article/${post.slug}`} key={post.id}>
              <article className="flex cursor-pointer gap-4 transition hover:opacity-75">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:h-24 sm:w-32">
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs font-extrabold uppercase text-[#d41c3d]">
                    {post.category}
                  </p>

                  <h3 className="line-clamp-3 text-sm font-extrabold leading-snug text-black sm:text-base">
                    {post.title}
                  </h3>

                  <p className="mt-1 hidden text-sm text-gray-500 sm:block">
                    Lajm i zgjedhur
                  </p>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}