"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type BreakingItem = {
  id: number;
  title: string;
  link_url: string | null;
};

type BreakingSettings = {
  mode: "automatic" | "manual" | "off";
  manual_title: string | null;
  manual_link: string | null;
  duration_seconds: number | null;
  is_active: boolean;
};

export default function BreakingNews() {
  const [items, setItems] = useState<BreakingItem[]>([]);
  const [duration, setDuration] = useState<number | null>(10);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    async function fetchBreaking() {
      const { data: settings } = await supabase
        .from("breaking_settings")
        .select("*")
        .limit(1)
        .single();

      if (!settings || settings.mode === "off" || settings.is_active === false) {
        setItems([]);
        return;
      }

      const s = settings as BreakingSettings;
      setDuration(s.duration_seconds);

      if (s.mode === "manual") {
        if (!s.manual_title) {
          setItems([]);
          return;
        }

        setItems([
          {
            id: 1,
            title: s.manual_title,
            link_url: s.manual_link,
          },
        ]);

        return;
      }

      const { data: breakingPosts } = await supabase
        .from("posts")
        .select("id, title, slug")
        .eq("status", "published")
        .eq("is_breaking", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (breakingPosts && breakingPosts.length > 0) {
        setItems(
          breakingPosts.map((post) => ({
            id: post.id,
            title: post.title,
            link_url: `/article/${post.slug}`,
          }))
        );
        return;
      }

      const { data: latestPosts } = await supabase
        .from("posts")
        .select("id, title, slug")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(5);

      if (latestPosts) {
        setItems(
          latestPosts.map((post) => ({
            id: post.id,
            title: post.title,
            link_url: `/article/${post.slug}`,
          }))
        );
      }
    }

    fetchBreaking();
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    if (duration === null) return;

    const timer = setTimeout(() => {
      setVisible(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length);
        setVisible(true);
      }, 400);
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [items, index, duration]);

  if (items.length === 0) return null;

  const current = items[index];

  const content = (
    <div className="group relative min-w-0 flex-1 overflow-hidden">
      <p
        className={`truncate text-sm font-extrabold text-black transition-all duration-500 md:text-base ${
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {current.title}
      </p>
    </div>
  );

  return (
    <section className="border-b bg-gray-50">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <span className="flex shrink-0 items-center gap-2 rounded-md bg-[#d41c3d] px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          BREAKING
        </span>

        {current.link_url ? (
          <a href={current.link_url} className="min-w-0 flex-1">
            {content}
          </a>
        ) : (
          <div className="min-w-0 flex-1">{content}</div>
        )}
      </div>
    </section>
  );
}