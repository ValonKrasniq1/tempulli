"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
};

export default function MostRead() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function loadPosts() {
      const { data } = await supabase
        .from("posts")
        .select("id,title,slug,category")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) {
        setPosts(data);
      }
    }

    loadPosts();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h2 className="mb-6 border-b pb-3 text-2xl font-bold">
        MË TË LEXUARAT
      </h2>

      <div className="grid gap-4">
        {posts.map((post, index) => (
          <Link key={post.id} href={`/article/${post.slug}`}>
            <article className="flex gap-4 border-b pb-4 transition hover:bg-gray-50">
              <span className="text-2xl font-bold text-[#d41c3d]">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div>
                <p className="mb-1 text-xs font-bold text-[#d41c3d]">
                  {post.category}
                </p>

                <h3 className="font-bold text-black">
                  {post.title}
                </h3>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}