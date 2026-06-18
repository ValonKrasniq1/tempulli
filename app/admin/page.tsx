"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  content: string;
  status: "published" | "draft";
  image_url?: string | null;
  is_featured?: boolean;
  is_sidebar?: boolean;
  created_at?: string;
};

type Stats = {
  totalViews: number;
  todayViews: number;
  topPage: string;
};

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replaceAll("ë", "e")
    .replaceAll("ç", "c")
    .replaceAll("’", "")
    .replaceAll("'", "")
    .replaceAll(":", "")
    .replaceAll(",", "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("LUGINA");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSidebar, setIsSidebar] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    todayViews: 0,
    topPage: "-",
  });
  const [loading, setLoading] = useState(false);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setPosts(data as Post[]);
  }

  async function fetchStats() {
    const { count: totalViews } = await supabase
      .from("page_views")
      .select("*", { count: "exact", head: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: todayViews } = await supabase
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    const { data: views } = await supabase.from("page_views").select("path");

    let topPage = "-";

    if (views && views.length > 0) {
      const counts: Record<string, number> = {};

      views.forEach((view) => {
        counts[view.path] = (counts[view.path] || 0) + 1;
      });

      topPage = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }

    setStats({
      totalViews: totalViews || 0,
      todayViews: todayViews || 0,
      topPage,
    });
  }

  useEffect(() => {
    fetchPosts();
    fetchStats();

    const interval = setInterval(() => {
      fetchStats();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  async function uploadImage() {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `posts/${fileName}`;

    const { error } = await supabase.storage
      .from("news-images")
      .upload(filePath, imageFile);

    if (error) {
      alert("Gabim gjatë upload-it të fotos: " + error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("news-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function addPost(status: "published" | "draft") {
    if (!title || !content) {
      alert("Shkruaj titullin dhe përmbajtjen.");
      return;
    }

    setLoading(true);

    const imageUrl = await uploadImage();

    const { error } = await supabase.from("posts").insert({
      title,
      slug: createSlug(title),
      category,
      content,
      status,
      image_url: imageUrl,
      is_featured: isFeatured,
      is_sidebar: isSidebar,
    });

    setLoading(false);

    if (error) {
      alert("Gabim gjatë publikimit: " + error.message);
      return;
    }

    setTitle("");
    setContent("");
    setImageFile(null);
    setIsFeatured(false);
    setIsSidebar(false);
    fetchPosts();
    fetchStats();
  }

  async function deletePost(id: number) {
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      alert("Gabim gjatë fshirjes: " + error.message);
      return;
    }

    fetchPosts();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-[#d41c3d]">
          Tempulli Admin Dashboard
        </h1>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Total lajme</p>
            <h3 className="text-3xl font-bold text-black">{posts.length}</h3>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Vizita totale</p>
            <h3 className="text-3xl font-bold text-black">
              {stats.totalViews}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Vizita sot</p>
            <h3 className="text-3xl font-bold text-black">
              {stats.todayViews}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Faqja më e vizituar</p>
            <h3 className="truncate text-lg font-bold text-black">
              {stats.topPage}
            </h3>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="rounded-xl bg-white p-6 shadow lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold text-black">
              Shto lajm të ri
            </h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulli i lajmit"
              className="mb-4 w-full rounded border p-3 text-black"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mb-4 w-full rounded border p-3 text-black"
            >
              <option>LUGINA</option>
              <option>KOSOVË</option>
              <option>SPORT</option>
              <option>TEKNOLOGJI</option>
            </select>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Përmbajtja e lajmit"
              rows={8}
              className="mb-4 w-full rounded border p-3 text-black"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mb-4 w-full rounded border p-3 text-black"
            />

            <div className="mb-4 rounded border bg-gray-50 p-4">
              <label className="mb-3 flex items-center gap-3 text-black">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                Vendose si lajm kryesor në ballinë
              </label>

              <label className="flex items-center gap-3 text-black">
                <input
                  type="checkbox"
                  checked={isSidebar}
                  onChange={(e) => setIsSidebar(e.target.checked)}
                />
                Vendose në anën e djathtë të ballinës
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => addPost("published")}
                disabled={loading}
                className="rounded bg-[#d41c3d] px-6 py-3 font-bold text-white disabled:opacity-60"
              >
                {loading ? "Duke publikuar..." : "Publiko"}
              </button>

              <button
                onClick={() => addPost("draft")}
                disabled={loading}
                className="rounded bg-black px-6 py-3 font-bold text-white disabled:opacity-60"
              >
                Ruaj Draft
              </button>
            </div>
          </section>

          <aside className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-6 text-2xl font-bold text-black">Statistika</h2>

            <p className="mb-3 text-black">
              Published: {posts.filter((p) => p.status === "published").length}
            </p>

            <p className="mb-3 text-black">
              Draft: {posts.filter((p) => p.status === "draft").length}
            </p>

            <p className="mb-3 text-black">
              Kryesor: {posts.filter((p) => p.is_featured).length}
            </p>

            <p className="mb-3 text-black">
              Anash: {posts.filter((p) => p.is_sidebar).length}
            </p>

            <p className="mb-3 text-black">Rifreskohet çdo 10 sekonda</p>
          </aside>
        </div>

        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-6 text-2xl font-bold text-black">
            Lajmet e fundit
          </h2>

          {posts.length === 0 ? (
            <p className="text-gray-500">Ende nuk ka lajme.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="rounded border p-4">
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-black">
                      {post.title}
                    </h3>

                    <button
                      onClick={() => deletePost(post.id)}
                      className="rounded bg-gray-100 px-3 py-1 text-sm font-bold text-red-600"
                    >
                      Fshi
                    </button>
                  </div>

                  <p className="mb-2 text-sm font-bold text-[#d41c3d]">
                    {post.category} • {post.status}
                    {post.is_featured ? " • LAJM KRYESOR" : ""}
                    {post.is_sidebar ? " • ANASH DJATHTAS" : ""}
                  </p>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="mb-3 h-48 w-full rounded object-cover"
                    />
                  )}

                  <p className="text-gray-700">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}