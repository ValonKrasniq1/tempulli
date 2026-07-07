"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Post = {
  id: number;
  title: string;
  category: string;
  status: string;
  created_at: string;
};

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [todayVisitors, setTodayVisitors] = useState(0);
  const [topPage, setTopPage] = useState("-");
  const [billboards, setBillboards] = useState(0);
  const [campaigns, setCampaigns] = useState(0);
  const [breakingMode, setBreakingMode] = useState("-");

  async function fetchDashboard() {
    const { data: postsData } = await supabase
      .from("posts")
      .select("id, title, category, status, created_at")
      .order("created_at", { ascending: false });

    if (postsData) setPosts(postsData);

    const { data: allViews } = await supabase
      .from("page_views")
      .select("visitor_id, path, created_at");

    if (allViews) {
      const uniqueVisitors = new Set(
        allViews.map((v) => v.visitor_id).filter(Boolean)
      );

      setTotalVisitors(uniqueVisitors.size);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayUniqueVisitors = new Set(
        allViews
          .filter((v) => new Date(v.created_at) >= today)
          .map((v) => v.visitor_id)
          .filter(Boolean)
      );

      setTodayVisitors(todayUniqueVisitors.size);

      const counts: Record<string, number> = {};
      allViews.forEach((v) => {
        counts[v.path] = (counts[v.path] || 0) + 1;
      });

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) setTopPage(sorted[0][0]);
    }

    const { count: billboardCount } = await supabase
      .from("billboard_ads")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("is_archived", false);

    setBillboards(billboardCount || 0);

    const { count: campaignCount } = await supabase
      .from("top_campaigns")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    setCampaigns(campaignCount || 0);

    const { data: breaking } = await supabase
      .from("breaking_settings")
      .select("mode")
      .limit(1)
      .single();

    if (breaking) setBreakingMode(breaking.mode);
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const published = posts.filter((p) => p.status === "published").length;
  const draft = posts.filter((p) => p.status === "draft").length;
  const archived = posts.filter((p) => p.status === "archived").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#d41c3d]">
            Tempulli Admin Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Përmbledhje e portalit, statistikave dhe moduleve aktive.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin/articles" className="rounded-xl bg-[#d41c3d] px-4 py-3 text-sm font-extrabold text-white">
            + Shto lajm
          </Link>

          <Link href="/admin/breaking" className="rounded-xl border bg-white px-4 py-3 text-sm font-extrabold">
            ⚡ Breaking
          </Link>

          <a href="/" target="_blank" className="rounded-xl border bg-white px-4 py-3 text-sm font-extrabold">
            Shiko faqen ↗
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Total lajme" value={posts.length} label="Artikuj" />
        <Card title="Vizitorë unikë" value={totalVisitors} label="Total" />
        <Card title="Vizitorë sot" value={todayVisitors} label="Sot" />
        <Card title="Faqja më e vizituar" value={topPage} label="Top page" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 xl:col-span-2">
          <h2 className="mb-5 text-2xl font-extrabold">Lajmet e fundit</h2>

          <div className="space-y-3">
            {posts.slice(0, 6).map((post) => (
              <div key={post.id} className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <h3 className="font-extrabold">{post.title}</h3>
                  <p className="text-sm text-gray-500">
                    {post.category} • {post.status}
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">
                  {post.status}
                </span>
              </div>
            ))}
          </div>

          <Link href="/admin/articles" className="mt-5 inline-block rounded-xl border px-4 py-3 text-sm font-extrabold">
            Shiko të gjitha lajmet →
          </Link>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="mb-5 text-2xl font-extrabold">Statistika</h2>

            <Stat label="Published" value={published} />
            <Stat label="Draft" value={draft} />
            <Stat label="Archived" value={archived} />
            <Stat label="Breaking mode" value={breakingMode} />
            <Stat label="Billboards aktive" value={billboards} />
            <Stat label="Campaigns aktive" value={campaigns} />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="mb-4 text-xl font-extrabold">Veprime të shpejta</h2>

            <div className="grid gap-3">
              <Quick href="/admin/articles" text="📰 Articles" />
              <Quick href="/admin/breaking" text="⚡ Breaking News" />
              <Quick href="/admin/live" text="📡 LIVE Updates" />
              <Quick href="/admin/advertising" text="📢 Advertising" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, value, label }: { title: string; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <p className="text-sm font-semibold text-gray-500">{title}</p>
      <h3 className="mt-2 truncate text-4xl font-extrabold text-black">{value}</h3>
      <p className="mt-2 text-xs font-bold text-[#d41c3d]">{label}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="mb-3 flex justify-between text-sm font-bold">
      <span className="text-gray-500">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Quick({ href, text }: { href: string; text: string }) {
  return (
    <Link href={href} className="rounded-xl border px-4 py-3 text-sm font-extrabold hover:bg-gray-50">
      {text}
    </Link>
  );
}