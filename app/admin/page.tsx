"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  lead?: string | null;
  content: string;
  status: "published" | "draft" | "archived";
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
  const [lead, setLead] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSidebar, setIsSidebar] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

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

    const interval = setInterval(fetchStats, 10000);
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

  function resetForm() {
    setTitle("");
    setCategory("LUGINA");
    setLead("");
    setContent("");
    setImageFile(null);
    setIsFeatured(false);
    setIsSidebar(false);
    setEditingPost(null);
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
      lead,
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

    resetForm();
    fetchPosts();
    fetchStats();
  }

  async function updatePost() {
    if (!editingPost) return;

    if (!title || !content) {
      alert("Shkruaj titullin dhe përmbajtjen.");
      return;
    }

    setLoading(true);

    const newImageUrl = imageFile ? await uploadImage() : editingPost.image_url;

    const { error } = await supabase
      .from("posts")
      .update({
        title,
        slug: createSlug(title),
        category,
        lead,
        content,
        image_url: newImageUrl,
        is_featured: isFeatured,
        is_sidebar: isSidebar,
      })
      .eq("id", editingPost.id);

    setLoading(false);

    if (error) {
      alert("Gabim gjatë editimit: " + error.message);
      return;
    }

    resetForm();
    fetchPosts();
    fetchStats();
  }

  function startEdit(post: Post) {
    setEditingPost(post);
    setTitle(post.title);
    setCategory(post.category);
    setLead(post.lead || "");
    setContent(post.content);
    setIsFeatured(!!post.is_featured);
    setIsSidebar(!!post.is_sidebar);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function archivePost(id: number) {
    const { error } = await supabase
      .from("posts")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) {
      alert("Gabim gjatë arkivimit: " + error.message);
      return;
    }

    fetchPosts();
  }

  async function restorePost(id: number) {
    const { error } = await supabase
      .from("posts")
      .update({ status: "published" })
      .eq("id", id);

    if (error) {
      alert("Gabim gjatë rikthimit: " + error.message);
      return;
    }

    fetchPosts();
  }

  async function deletePost(id: number) {
    const confirmDelete = confirm("A je i sigurt që do ta fshish përgjithmonë?");
    if (!confirmDelete) return;

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
              {editingPost ? "Edito lajmin" : "Shto lajm të ri"}
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
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              placeholder="Paragrafi hyrës / lead"
              rows={3}
              className="mb-4 w-full rounded border p-3 text-black"
            />

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

            {editingPost?.image_url && (
              <img
                src={editingPost.image_url}
                alt={editingPost.title}
                className="mb-4 h-40 w-full rounded object-cover"
              />
            )}

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

            <div className="flex flex-wrap gap-3">
              {editingPost ? (
                <>
                  <button
                    onClick={updatePost}
                    disabled={loading}
                    className="rounded bg-[#d41c3d] px-6 py-3 font-bold text-white disabled:opacity-60"
                  >
                    {loading ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                  </button>

                  <button
                    onClick={resetForm}
                    className="rounded bg-gray-200 px-6 py-3 font-bold text-black"
                  >
                    Anulo
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
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
              Archived: {posts.filter((p) => p.status === "archived").length}
            </p>

            <p className="mb-3 text-black">
              Kryesor: {posts.filter((p) => p.is_featured).length}
            </p>

            <p className="mb-3 text-black">
              Anash: {posts.filter((p) => p.is_sidebar).length}
            </p>
          </aside>
        </div>

        <section className="mt-8 rounded-xl bg-white p-6 shadow">
          <h2 className="mb-6 text-2xl font-bold text-black">
            Lajmet e fundit
          </h2>

          {posts.length === 0 ? (
            <p className="text-gray-500">Ende nuk ka lajme.</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="h-28 w-full rounded-lg object-cover md:w-44"
                      />
                    ) : (
                      <div className="h-28 w-full rounded-lg bg-gray-300 md:w-44" />
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-lg font-bold leading-snug text-black">
                        {post.title}
                      </h3>

                      <p className="mt-1 text-sm font-bold text-[#d41c3d]">
                        {post.category} • {post.status}
                        {post.is_featured ? " • LAJM KRYESOR" : ""}
                        {post.is_sidebar ? " • ANASH DJATHTAS" : ""}
                      </p>

                      {post.lead ? (
                        <p className="mt-2 line-clamp-2 text-sm font-semibold text-gray-800">
                          {post.lead}
                        </p>
                      ) : (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                          {post.content}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 md:flex-col">
                      <button
                        onClick={() => startEdit(post)}
                        className="rounded bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700"
                      >
                        Edito
                      </button>

                      {post.status === "archived" ? (
                        <button
                          onClick={() => restorePost(post.id)}
                          className="rounded bg-green-100 px-3 py-1 text-sm font-bold text-green-700"
                        >
                          Rikthe
                        </button>
                      ) : (
                        <button
                          onClick={() => archivePost(post.id)}
                          className="rounded bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700"
                        >
                          Arkivo
                        </button>
                      )}

                      <button
                        onClick={() => deletePost(post.id)}
                        className="rounded bg-gray-100 px-3 py-1 text-sm font-bold text-red-600"
                      >
                        Fshi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}