"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Billboard = {
  id: number;
  title: string;
  media_url: string | null;
  media_type: string;
  link_url: string | null;
  duration_seconds: number;
};

export default function BillboardAd() {
  const [ads, setAds] = useState<Billboard[]>([]);
  const [current, setCurrent] = useState(0);

useEffect(() => {
  async function fetchAds() {
    const { data, error } = await supabase
      .from("billboard_ads")
      .select("*")
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("sort_order", { ascending: true });

    if (data) setAds(data);
  }

  fetchAds();
}, []);

  useEffect(() => {
    if (ads.length <= 1) return;

    const seconds = ads[current]?.duration_seconds || 10;

    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % ads.length);
    }, seconds * 1000);

    return () => clearTimeout(timer);
  }, [ads, current]);

if (ads.length === 0) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-5">
      <div className="flex h-[250px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
        HAPËSIRË REKLAMUESE 970x250
      </div>
    </section>
  );
}

  const ad = ads[current];

const content = (
  <section className="mx-auto max-w-7xl px-4 py-5">
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {ad.media_url ? (
          ad.media_type === "video" ? (
            <video
              src={ad.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto"
            />
          ) : (
            <img
  src={ad.media_url}
  alt={ad.title}
  className="w-full h-auto transition-transform duration-300 hover:scale-[1.01]"
/>
          )
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-extrabold text-white">
            {ad.title}
          </div>
        )}
      </div>
    </section>
  );

  if (ad.link_url) {
    return (
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}