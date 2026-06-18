"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import TopBar from "../../components/TopBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  status: string;
  image_url?: string | null;
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function searchPosts() {
      if (!q) return;

      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
        .order("created_at", { ascending: false });

      setPosts((data as Post[]) || []);
    }

    searchPosts();
  }, [q]);

  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-8 border-b pb-4 text-4xl font-bold text-black">
          Rezultatet për: {q}
        </h1>

        {posts.length === 0 ? (
          <p className="text-gray-500">Nuk u gjet asnjë lajm.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Link href={`/article/${post.slug}`} key={post.id}>
                <article className="cursor-pointer transition hover:opacity-75">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="mb-4 h-48 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mb-4 h-48 rounded-lg bg-gray-300"></div>
                  )}

                  <p className="mb-2 text-xs font-bold text-[#d41c3d]">
                    {post.category}
                  </p>

                  <h2 className="text-xl font-bold text-black">
                    {post.title}
                  </h2>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}