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

const AD_HEIGHT = 150;

export default function BillboardAd() {
  const [ads, setAds] = useState<Billboard[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchAds() {
      const { data } = await supabase
        .from("billboard_ads")
        .select("*")
        .eq("is_active", true)
        .eq("is_archived", false)
        .order("sort_order", { ascending: true });

      if (data) setAds(data as Billboard[]);
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
      <section className="mx-auto max-w-7xl px-4" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <div
          className="flex items-center justify-center rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-400 shadow-sm"
          style={{ height: AD_HEIGHT, maxHeight: AD_HEIGHT, overflow: "hidden" }}
        >
          HAPËSIRË REKLAMUESE 970x250
        </div>
      </section>
    );
  }

  const ad = ads[current];

  const adBox = (
    <div
      className="rounded-xl border border-gray-200 bg-white shadow-sm"
      style={{
        height: AD_HEIGHT,
        maxHeight: AD_HEIGHT,
        overflow: "hidden",
      }}
    >
      {ad.media_url ? (
        ad.media_type === "video" ? (
          <video
            src={ad.media_url}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: "100%",
              height: "150px",
              maxHeight: "150px",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        ) : (
          <img
            src={ad.media_url}
            alt={ad.title}
            style={{
              width: "100%",
              height: "150px",
              maxHeight: "150px",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        )
      ) : (
        <div className="flex h-full items-center justify-center text-xs font-extrabold text-gray-400">
          {ad.title}
        </div>
      )}
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-4" style={{ paddingTop: 24, paddingBottom: 24 }}>
      {ad.link_url ? (
        <a href={ad.link_url} target="_blank" rel="noopener noreferrer">
          {adBox}
        </a>
      ) : (
        adBox
      )}
    </section>
  );
}