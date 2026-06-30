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
  status: string;
  image_url?: string | null;
  is_featured?: boolean;
  is_sidebar?: boolean;
};

const POSTS_PER_PAGE = 12;

export default function LatestNews() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);

      const from = (page - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, count, error } = await supabase
        .from("posts")
        .select("*", { count: "exact" })
        .eq("status", "published")
        .neq("is_featured", true)
        .neq("is_sidebar", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error && data) {
        setPosts(data as Post[]);
        setTotalPosts(count || 0);
      }

      setLoading(false);
    }

    fetchPosts();
  }, [page]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between border-b pb-3">
        <h2 className="text-2xl font-bold text-black">LAJMET E FUNDIT</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading &&
          Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="mb-4 h-40 rounded-lg bg-gray-200" />
              <div className="mb-2 h-3 w-16 rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
            </div>
          ))}

        {!loading &&
          posts.map((post) => (
            <Link href={`/article/${post.slug}`} key={post.id}>
              <article className="cursor-pointer transition hover:opacity-75">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="mb-4 h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-4 h-40 rounded-lg bg-gray-300" />
                )}

                <p className="mb-2 text-xs font-bold text-[#d41c3d]">
                  {post.category}
                </p>

                <h3 className="font-bold leading-snug text-black">
                  {post.title}
                </h3>
              </article>
            </Link>
          ))}
      </div>

      {!loading && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold text-black disabled:opacity-30"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;

            return (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${
                  page === pageNumber
                    ? "bg-[#d41c3d] text-white"
                    : "bg-white text-black"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold text-black disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}