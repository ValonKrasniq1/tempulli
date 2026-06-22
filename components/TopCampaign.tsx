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

      if (error) {
        console.error("TopCampaign error:", error.message);
        return;
      }

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
    <div className="bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          {campaign.media_url && (
            campaign.media_type === "video" ? (
              <video
                src={campaign.media_url}
                muted
                autoPlay
                loop
                playsInline
                controls
                className="h-20 w-44 rounded-lg bg-white object-cover"
              />
            ) : (
              <img
                src={campaign.media_url}
                alt={campaign.title}
                className="h-20 w-44 rounded-lg bg-white object-cover"
              />
            )
          )}

          <div className="min-w-0">
            <span className="mb-2 inline-block rounded bg-[#d41c3d] px-3 py-1 text-xs font-extrabold text-white">
              {campaign.campaign_type || "MARKETING"}
            </span>

            <h2 className="truncate text-xl font-extrabold leading-tight md:text-2xl">
              {campaign.title}
            </h2>

            {campaign.description && (
              <p className="mt-1 line-clamp-1 text-sm text-gray-300">
                {campaign.description}
              </p>
            )}
          </div>
        </div>

        {campaign.link_url && (
          <span className="shrink-0 text-sm font-bold text-white underline">
            Kliko për më shumë →
          </span>
        )}
      </div>
    </div>
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