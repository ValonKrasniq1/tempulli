"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Post = {
  id: number;
  title: string;
  slug: string;
  category: string;
  subcategory?: string | null;
  lead?: string | null;
  content: string;
  status: "published" | "draft" | "archived";
  image_url?: string | null;
  is_featured?: boolean;
  is_sidebar?: boolean;
  is_breaking?: boolean;
  created_at?: string;
};

type Stats = {
  totalViews: number;
  todayViews: number;
  topPage: string;
};

const POSTS_PER_PAGE = 10;

const categoryOptions = {
  LAJME: [
    "Lugina e Preshevës",
    "Kosovë",
    "Shqipëri",
    "Diasporë",
    "Rajon",
    "Evropë",
    "Botë",
  ],
  SPORT: ["Futboll", "Basketboll", "Formula 1", "Sporte të tjera"],
  "TECH & AUTO": ["Teknologji", "Automjete", "Telefona", "Lojëra"],
  FUN: ["Kuriozitete", "Fakte", "Të tjera"],
  KULTURË: ["Film", "Muzikë", "Histori", "Libra", "Fotografi"],
  EKONOMI: ["Financa", "Biznes"],
  MAGAZINA: ["Shëndeti", "Jetë", "Lifestyle", "Kuriozitete"],
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
  const [category, setCategory] = useState("LAJME");
  const [subcategory, setSubcategory] = useState("");
  const [lead, setLead] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSidebar, setIsSidebar] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    todayViews: 0,
    topPage: "-",
  });

  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data as Post[]);
      setCurrentPage(1);
    }
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
    setCategory("LAJME");
    setSubcategory("");
    setLead("");
    setContent("");
    setImageFile(null);
    setIsFeatured(false);
    setIsSidebar(false);
    setIsBreaking(false);
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
      subcategory,
      lead,
      content,
      status,
      image_url: imageUrl,
      is_featured: isFeatured,
      is_sidebar: isSidebar,
      is_breaking: isBreaking,
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
        subcategory,
        lead,
        content,
        image_url: newImageUrl,
        is_featured: isFeatured,
        is_sidebar: isSidebar,
        is_breaking: isBreaking,
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
    setCategory(post.category || "LAJME");
    setSubcategory(post.subcategory || "");
    setLead(post.lead || "");
    setContent(post.content);
    setIsFeatured(!!post.is_featured);
    setIsSidebar(!!post.is_sidebar);
    setIsBreaking(!!post.is_breaking);
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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#d41c3d]">
            Tempulli Admin Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Menaxho lajmet, statistikat dhe përmbajtjen kryesore të portalit.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/breaking"
            className="rounded-xl border bg-white px-4 py-3 text-sm font-extrabold shadow-sm hover:bg-gray-50"
          >
            ⚡ Breaking
          </Link>

          <Link
            href="/admin/billboard"
            className="rounded-xl border bg-white px-4 py-3 text-sm font-extrabold shadow-sm hover:bg-gray-50"
          >
            🖼 Billboard
          </Link>

          <a
            href="/"
            target="_blank"
            className="rounded-xl bg-[#d41c3d] px-4 py-3 text-sm font-extrabold text-white shadow-sm"
          >
            Shiko faqen ↗
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold text-gray-500">Total lajme</p>
          <div className="mt-2 flex items-end justify-between">
            <h3 className="text-4xl font-extrabold text-black">{posts.length}</h3>
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#d41c3d]">
              Artikuj
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold text-gray-500">Vizita totale</p>
          <div className="mt-2 flex items-end justify-between">
            <h3 className="text-4xl font-extrabold text-black">
              {stats.totalViews}
            </h3>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
              Total
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold text-gray-500">Vizita sot</p>
          <div className="mt-2 flex items-end justify-between">
            <h3 className="text-4xl font-extrabold text-black">
              {stats.todayViews}
            </h3>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
              Sot
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm font-semibold text-gray-500">
            Faqja më e vizituar
          </p>
          <h3 className="mt-3 truncate text-xl font-extrabold text-black">
            {stats.topPage}
          </h3>
          <p className="mt-1 text-xs font-medium text-gray-400">Kreu / Ballina</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 xl:col-span-2">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-black">
                {editingPost ? "Edito lajmin" : "Shto lajm të ri"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Plotëso të dhënat kryesore dhe publiko lajmin.
              </p>
            </div>

            {editingPost && (
              <button
                onClick={resetForm}
                className="w-fit rounded-xl bg-gray-100 px-4 py-2 text-sm font-extrabold text-black"
              >
                Anulo editimin
              </button>
            )}
          </div>

          <div className="grid gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titulli i lajmit"
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black outline-none focus:border-[#d41c3d]"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory("");
                }}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black outline-none focus:border-[#d41c3d]"
              >
                <option>LAJME</option>
                <option>SPORT</option>
                <option>TECH & AUTO</option>
                <option>FUN</option>
                <option>KULTURË</option>
                <option>EKONOMI</option>
                <option>MAGAZINA</option>
              </select>

              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black outline-none focus:border-[#d41c3d]"
              >
                <option value="">Zgjidh nënkategorinë</option>
                {categoryOptions[
                  category as keyof typeof categoryOptions
                ]?.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <textarea
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              placeholder="Paragrafi hyrës / lead - ky del më i theksuar në artikull"
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black outline-none focus:border-[#d41c3d]"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Përmbajtja e lajmit"
              rows={9}
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-black outline-none focus:border-[#d41c3d]"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center hover:bg-gray-100">
                <span className="text-2xl">☁️</span>
                <span className="mt-2 text-sm font-extrabold text-black">
                  Kliko për të ngarkuar
                </span>
                <span className="text-xs text-gray-500">JPG, PNG, WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-extrabold text-black">
                  Opsionet e lajmit
                </p>

                <label className="mb-3 flex items-center gap-3 text-sm font-bold text-black">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  Vendose si lajm kryesor në ballinë
                </label>

                <label className="mb-3 flex items-center gap-3 text-sm font-bold text-black">
                  <input
                    type="checkbox"
                    checked={isSidebar}
                    onChange={(e) => setIsSidebar(e.target.checked)}
                  />
                  Vendose në anën e djathtë të ballinës
                </label>

                <label className="flex items-center gap-3 text-sm font-bold text-black">
                  <input
                    type="checkbox"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                  />
                  Shfaq si Breaking News
                </label>
              </div>
            </div>

            {editingPost?.image_url && (
              <img
                src={editingPost.image_url}
                alt={editingPost.title}
                className="h-48 w-full rounded-2xl object-cover"
              />
            )}

            <div className="flex flex-wrap gap-3">
              {editingPost ? (
                <button
                  onClick={updatePost}
                  disabled={loading}
                  className="rounded-xl bg-[#d41c3d] px-6 py-3 font-extrabold text-white disabled:opacity-60"
                >
                  {loading ? "Duke ruajtur..." : "Ruaj ndryshimet"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => addPost("published")}
                    disabled={loading}
                    className="rounded-xl bg-[#d41c3d] px-6 py-3 font-extrabold text-white disabled:opacity-60"
                  >
                    {loading ? "Duke publikuar..." : "Publiko"}
                  </button>

                  <button
                    onClick={() => addPost("draft")}
                    disabled={loading}
                    className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-extrabold text-black disabled:opacity-60"
                  >
                    Ruaj si Draft
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="mb-5 text-2xl font-extrabold text-black">
              Statistika
            </h2>

            <div className="space-y-3 text-sm font-bold">
              <div className="flex justify-between">
                <span className="text-gray-500">Published</span>
                <span>{posts.filter((p) => p.status === "published").length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Draft</span>
                <span>{posts.filter((p) => p.status === "draft").length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Archived</span>
                <span>{posts.filter((p) => p.status === "archived").length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Kryesor</span>
                <span>{posts.filter((p) => p.is_featured).length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Anash</span>
                <span>{posts.filter((p) => p.is_sidebar).length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Breaking</span>
                <span>{posts.filter((p) => p.is_breaking).length}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="mb-4 text-xl font-extrabold text-black">
              Veprime të shpejta
            </h2>

            <div className="grid gap-3">
              <Link
                href="/admin/breaking"
                className="rounded-xl border px-4 py-3 text-sm font-extrabold hover:bg-gray-50"
              >
                ⚡ Breaking News
              </Link>

              <Link
                href="/admin/live"
                className="rounded-xl border px-4 py-3 text-sm font-extrabold hover:bg-gray-50"
              >
                📡 LIVE Updates
              </Link>

              <Link
                href="/admin/billboard"
                className="rounded-xl border px-4 py-3 text-sm font-extrabold hover:bg-gray-50"
              >
                🖼 Billboard Ads
              </Link>

              <Link
                href="/admin/campaigns"
                className="rounded-xl border px-4 py-3 text-sm font-extrabold hover:bg-gray-50"
              >
                📢 Campaigns
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="mb-4 text-xl font-extrabold text-black">
              Burimi i trafikut
            </h2>

            <div className="space-y-4 text-sm font-bold">
              {[
                ["Direct", "45.6%"],
                ["Facebook", "24.3%"],
                ["Google", "18.7%"],
                ["Instagram", "6.4%"],
              ].map(([source, value]) => (
                <div key={source}>
                  <div className="mb-1 flex justify-between">
                    <span>{source}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-[#d41c3d]"
                      style={{ width: value }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-black">
              Lajmet e fundit
            </h2>
            <p className="text-sm text-gray-500">
              Faqja {currentPage} nga {totalPages || 1}
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-500">Ende nuk ka lajme.</p>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                    {post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="h-28 w-full rounded-xl object-cover md:w-44"
                      />
                    ) : (
                      <div className="h-28 w-full rounded-xl bg-gray-200 md:w-44" />
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-black">
                        {post.title}
                      </h3>

                      <p className="mt-1 text-sm font-extrabold text-[#d41c3d]">
                        {post.category}
                        {post.subcategory ? ` • ${post.subcategory}` : ""} •{" "}
                        {post.status}
                        {post.is_featured ? " • LAJM KRYESOR" : ""}
                        {post.is_sidebar ? " • ANASH" : ""}
                        {post.is_breaking ? " • BREAKING" : ""}
                      </p>

                      {post.lead ? (
                        <p className="mt-2 line-clamp-2 text-sm font-semibold text-gray-700">
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
                        className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-extrabold text-blue-700"
                      >
                        Edito
                      </button>

                      {post.status === "archived" ? (
                        <button
                          onClick={() => restorePost(post.id)}
                          className="rounded-xl bg-green-50 px-3 py-2 text-sm font-extrabold text-green-700"
                        >
                          Rikthe
                        </button>
                      ) : (
                        <button
                          onClick={() => archivePost(post.id)}
                          className="rounded-xl bg-yellow-50 px-3 py-2 text-sm font-extrabold text-yellow-700"
                        >
                          Arkivo
                        </button>
                      )}

                      <button
                        onClick={() => deletePost(post.id)}
                        className="rounded-xl bg-red-50 px-3 py-2 text-sm font-extrabold text-red-600"
                      >
                        Fshi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border px-4 py-2 font-extrabold text-black disabled:opacity-30"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`rounded-xl px-4 py-2 font-extrabold ${
                        currentPage === pageNumber
                          ? "bg-[#d41c3d] text-white"
                          : "bg-gray-100 text-black"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-xl border px-4 py-2 font-extrabold text-black disabled:opacity-30"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}