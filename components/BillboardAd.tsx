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

    console.log("ADS DATA:", data);
    console.log("ADS ERROR:", error);

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
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex h-[250px] items-center justify-center rounded-lg bg-gradient-to-r from-red-700 to-red-500 text-4xl font-extrabold text-white">
          HAPËSIRË REKLAMUESE 970x250
        </div>
      </section>
    );
  }

  const ad = ads[current];

  const content = (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="h-[250px] overflow-hidden rounded-lg bg-red-600">
        {ad.media_url ? (
          ad.media_type === "video" ? (
            <video
              src={ad.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={ad.media_url}
              alt={ad.title}
              className="h-full w-full object-cover"
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