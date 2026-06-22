"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Campaign = {
  id: number;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: string;
  link_url: string | null;
  campaign_type: string;
  duration_seconds: number;
  is_active: boolean;
  is_exclusive: boolean;
};

export default function TopCampaign() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function fetchCampaigns() {
      const now = new Date().toISOString();

      const { data } = await supabase
        .from("top_campaigns")
        .select("*")
        .eq("is_active", true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!data) return;

      const exclusive = data.find((item) => item.is_exclusive);
      setCampaigns(exclusive ? [exclusive] : data);
    }

    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (campaigns.length <= 1) return;

    const seconds = campaigns[current]?.duration_seconds || 10;

    const interval = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % campaigns.length);
    }, seconds * 1000);

    return () => clearTimeout(interval);
  }, [campaigns, current]);

  if (campaigns.length === 0) return null;

  const campaign = campaigns[current];

  const content = (
    <div className="bg-black text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {campaign.media_url ? (
            campaign.media_type === "video" ? (
              <video
                src={campaign.media_url}
                muted
                autoPlay
                loop
                playsInline
                controls
                className="h-24 w-48 rounded-lg object-cover"
              />
            ) : (
              <img
                src={campaign.media_url}
                alt={campaign.title}
                className="h-24 w-48 rounded-lg object-cover"
              />
            )
          ) : null}

          <div>
            <span className="mb-2 inline-block rounded bg-[#d41c3d] px-3 py-1 text-xs font-extrabold">
              {campaign.campaign_type}
            </span>

            <h2 className="text-2xl font-extrabold leading-tight">
              {campaign.title}
            </h2>

            {campaign.description && (
              <p className="mt-1 text-sm text-gray-300">
                {campaign.description}
              </p>
            )}
          </div>
        </div>

        {campaign.link_url && (
          <span className="text-sm font-bold text-white underline">
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