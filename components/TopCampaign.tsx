"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Campaign = {
  id: number;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: string | null;
  link_url: string | null;
  campaign_type: string | null;
  duration_seconds: number | null;
  is_active: boolean;
  is_exclusive: boolean | null;
  expires_at?: string | null;
};

export default function TopCampaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchCampaigns() {
      const { data, error } = await supabase
        .from("top_campaigns")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) return;

      const now = new Date();

      const validCampaigns =
        data?.filter((item) => {
          if (!item.expires_at) return true;
          return new Date(item.expires_at) > now;
        }) || [];

      const exclusive = validCampaigns.find((item) => item.is_exclusive);
      setCampaigns(exclusive ? [exclusive] : validCampaigns);
    }

    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (campaigns.length <= 1) return;

    const seconds = campaigns[current]?.duration_seconds || 10;

    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % campaigns.length);
    }, seconds * 1000);

    return () => clearTimeout(timer);
  }, [campaigns, current]);

  if (campaigns.length === 0) return null;

  const campaign = campaigns[current];

  const content = (
    <section className="border-b bg-[#111111] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {campaign.media_url && (
            <div className="overflow-hidden rounded-xl bg-white/10">
              {campaign.media_type === "video" ? (
                <video
                  src={campaign.media_url}
                  muted
                  autoPlay
                  loop
                  playsInline
                  controls
                  className="h-[170px] w-full object-cover md:h-[135px] md:w-[240px]"
                />
              ) : (
                <img
                  src={campaign.media_url}
                  alt={campaign.title}
                  className="h-[170px] w-full object-cover md:h-[135px] md:w-[240px]"
                />
              )}
            </div>
          )}

          <div className="min-w-0">
            <span className="mb-2 inline-block rounded bg-[#d41c3d] px-3 py-1 text-xs font-extrabold text-white">
              {campaign.campaign_type || "MARKETING"}
            </span>

            <h2 className="text-2xl font-extrabold leading-tight md:text-3xl">
              {campaign.title}
            </h2>

            {campaign.description && (
              <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
                {campaign.description}
              </p>
            )}
          </div>
        </div>

        {campaign.link_url && (
          <span className="shrink-0 rounded-full border border-white/30 px-4 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-black">
            Kliko për më shumë →
          </span>
        )}
      </div>
    </section>
  );

  if (campaign.link_url) {
    return (
      <a href={campaign.link_url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}