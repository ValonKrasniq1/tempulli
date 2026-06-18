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
};

export default function LatestNews() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
    }

    fetchPosts();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between border-b pb-3">
        <h2 className="text-2xl font-bold text-black">LAJMET E FUNDIT</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <Link href={`/article/${post.slug}`} key={post.id}>
            <article className="cursor-pointer transition hover:opacity-75">
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="mb-4 h-40 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mb-4 h-40 rounded-lg bg-gray-300"></div>
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
    </section>
  );
}