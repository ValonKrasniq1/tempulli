
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "../lib/supabase";

type Ad = {
  id: number;
  title: string;
  position: string;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  desktop_height: number | null;
  mobile_height: number | null;
};

type Props = {
  position: string;
  height?: string;
  label?: string;
  fixedHeight?: boolean;
};

export default function AdSlot({
  position,
  height = "300px",
  label = "REKLAMË",
  fixedHeight = false,
}: Props) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchAd() {
      setLoading(true);
      setAd(null);

      try {
        const { data, error } = await supabase
          .from("ad_banners")
          .select(
            "id,title,position,image_url,link_url,is_active,desktop_height,mobile_height"
          )
          .eq("position", position)
          .eq("is_active", true)
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!active) return;

        if (error) {
          console.error("AdSlot:", error);
          setAd(null);
          return;
        }

        setAd((data as Ad) || null);
      } catch (error) {
        if (active) {
          console.error("AdSlot:", error);
          setAd(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchAd();

    return () => {
      active = false;
    };
  }, [position]);

  if (loading || !ad || !ad.image_url) {
    return null;
  }

  const isBillboard = position === "billboard";
  const isSticky = position === "sticky-mobile";

  const desktopHeight = isBillboard
    ? "150px"
    : fixedHeight
      ? height
      : ad.desktop_height && ad.desktop_height > 0
        ? `${ad.desktop_height}px`
        : height;

  const mobileHeight =
    isBillboard || fixedHeight
      ? desktopHeight
      : ad.mobile_height && ad.mobile_height > 0
        ? `${ad.mobile_height}px`
        : desktopHeight;

  const adStyle = {
    "--ad-desktop-height": desktopHeight,
    "--ad-mobile-height": mobileHeight,
  } as CSSProperties;

  let safeLink: string | null = null;

  if (ad.link_url) {
    try {
      const url = new URL(ad.link_url);

      if (
        url.protocol === "https:" ||
        url.protocol === "http:"
      ) {
        safeLink = url.href;
      }
    } catch {
      safeLink = null;
    }
  }

  const image = (
    <img
      src={ad.image_url}
      alt={ad.title || "Reklamë"}
      loading={isBillboard ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className="block h-full w-full object-contain"
    />
  );

  return (
    <div
      aria-label={label}
      className={
        isSticky
          ? "fixed inset-x-0 bottom-0 z-[9999] block w-full border-t border-gray-200 bg-white shadow-lg md:hidden"
          : "w-full min-w-0"
      }
    >
      {!isSticky && (
        <div className="mb-1.5 flex items-center justify-center gap-2">
          <span className="h-px w-6 bg-gray-200" />

          <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            {label}
          </span>

          <span className="h-px w-6 bg-gray-200" />
        </div>
      )}

      <div
        style={adStyle}
        className={`relative w-full overflow-hidden bg-white h-[var(--ad-mobile-height)] md:h-[var(--ad-desktop-height)] ${
          isSticky
            ? ""
            : "rounded-lg border border-gray-100"
        }`}
      >
        {safeLink ? (
          <a
            href={safeLink}
            target="_blank"
            rel="noopener noreferrer sponsored"
            aria-label={ad.title || "Hap reklamën"}
            className="block h-full w-full"
          >
            {image}
          </a>
        ) : (
          image
        )}
      </div>
    </div>
  );
}
