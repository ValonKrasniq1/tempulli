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

  useEffect(() => {
    async function fetchHeroNews() {
      const { data: featuredData } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { data: sidebarData } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .eq("is_sidebar", true)
        .order("created_at", { ascending: false })
        .limit(3);

      setFeatured(featuredData as Post);
      setSideNews((sidebarData as Post[]) || []);
    }

    fetchHeroNews();
  }, []);

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {featured ? (
          <Link href={`/article/${featured.slug}`}>
            <div className="relative h-[300px] cursor-pointer overflow-hidden rounded-xl bg-black transition hover:opacity-95 sm:h-[360px] lg:h-[420px]">
              {featured.image_url && (
                <img
                  src={featured.image_url}
                  alt={featured.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="absolute bottom-0 p-5 text-white md:p-8">
                <span className="mb-3 inline-block rounded-md bg-[#d41c3d] px-3 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-xs">
                  LAJMI KRYESOR
                </span>

                <h2 className="max-w-2xl text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                  {featured.title}
                </h2>

                <p className="mt-3 line-clamp-2 max-w-xl text-xs text-gray-200 sm:text-sm">
                  {featured.content}
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex h-[300px] items-center justify-center rounded-xl bg-black text-white sm:h-[360px] lg:h-[420px]">
            Zgjidh një lajm kryesor nga dashboard.
          </div>
        )}
      </div>

      <div className="space-y-4">
        {sideNews.length === 0 ? (
          <div className="rounded border p-4 text-sm text-gray-500">
            Zgjidh deri në 3 lajme për anën e djathtë nga dashboard.
          </div>
        ) : (
          sideNews.map((post) => (
            <Link href={`/article/${post.slug}`} key={post.id}>
              <article className="flex cursor-pointer gap-4 border-b pb-4 transition hover:opacity-70">
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-200">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs font-bold text-[#d41c3d]">
                    {post.category}
                  </p>

                  <h3 className="line-clamp-3 text-base font-bold leading-snug text-black">
                    {post.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">Lajm i zgjedhur</p>
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}