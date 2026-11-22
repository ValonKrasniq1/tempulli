"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import BannerCard, { type Banner } from "./BannerCard";

type Props = {
  position: string;
  refreshKey?: number;
  onEdit: (banner: Banner) => void;
  onBannersChanged?: () => void;
};

type Message = {
  type: "success" | "error";
  text: string;
};

export default function BannerList({
  position,
  refreshKey = 0,
  onEdit,
  onBannersChanged,
}: Props) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyBannerId, setBusyBannerId] = useState<number | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const fetchBanners = useCallback(async () => {
    if (!position) {
      setBanners([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("ad_banners")
      .select(
        `
          id,
          title,
          position,
          image_url,
          link_url,
          is_active,
          is_exclusive,
          duration_seconds,
          sort_order,
          desktop_height,
          mobile_height,
          start_date,
          end_date
        `
      )
      .eq("position", position)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("BannerList fetch error:", error);

      setMessage({
        type: "error",
        text: `Reklamat nuk mund të ngarkoheshin: ${error.message}`,
      });

      setBanners([]);
      setLoading(false);
      return;
    }

    setBanners((data || []) as Banner[]);
    setLoading(false);
  }, [position]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners, refreshKey]);

  async function toggleBannerActive(banner: Banner) {
    if (busyBannerId !== null) {
      return;
    }

    const nextActiveValue = !banner.is_active;

    setBusyBannerId(banner.id);
    setMessage(null);

    const previousBanners = banners;

    setBanners((currentBanners) =>
      currentBanners.map((currentBanner) =>
        currentBanner.id === banner.id
          ? {
              ...currentBanner,
              is_active: nextActiveValue,
            }
          : currentBanner
      )
    );

    const { error } = await supabase
      .from("ad_banners")
      .update({
        is_active: nextActiveValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", banner.id);

    if (error) {
      console.error("Banner active toggle error:", error);

      setBanners(previousBanners);

      setMessage({
        type: "error",
        text: `Statusi i reklamës nuk mund të ndryshohej: ${error.message}`,
      });

      setBusyBannerId(null);
      return;
    }

    setMessage({
      type: "success",
      text: nextActiveValue
        ? "Reklama u aktivizua me sukses."
        : "Reklama u çaktivizua me sukses.",
    });

    setBusyBannerId(null);
    onBannersChanged?.();
  }

  async function toggleBannerExclusive(banner: Banner) {
    if (busyBannerId !== null) {
      return;
    }

    const nextExclusiveValue = !banner.is_exclusive;

    if (nextExclusiveValue) {
      const confirmed = window.confirm(
        "Kur kjo reklamë bëhet Exclusive, të gjitha reklamat e tjera Exclusive në këtë pozicion do të çaktivizohen nga modaliteti Exclusive. Dëshiron të vazhdosh?"
      );

      if (!confirmed) {
        return;
      }
    }

    setBusyBannerId(banner.id);
    setMessage(null);

    const previousBanners = banners;

    if (nextExclusiveValue) {
      setBanners((currentBanners) =>
        currentBanners.map((currentBanner) => ({
          ...currentBanner,
          is_exclusive: currentBanner.id === banner.id,
        }))
      );

      const { error: resetError } = await supabase
        .from("ad_banners")
        .update({
          is_exclusive: false,
          updated_at: new Date().toISOString(),
        })
        .eq("position", position)
        .neq("id", banner.id);

      if (resetError) {
        console.error("Exclusive reset error:", resetError);

        setBanners(previousBanners);

        setMessage({
          type: "error",
          text: `Reklamat e tjera nuk mund të hiqeshin nga Exclusive: ${resetError.message}`,
        });

        setBusyBannerId(null);
        return;
      }
    } else {
      setBanners((currentBanners) =>
        currentBanners.map((currentBanner) =>
          currentBanner.id === banner.id
            ? {
                ...currentBanner,
                is_exclusive: false,
              }
            : currentBanner
        )
      );
    }

    const { error } = await supabase
      .from("ad_banners")
      .update({
        is_exclusive: nextExclusiveValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", banner.id);

    if (error) {
      console.error("Exclusive toggle error:", error);

      setBanners(previousBanners);

      setMessage({
        type: "error",
        text: `Modaliteti Exclusive nuk mund të ndryshohej: ${error.message}`,
      });

      await fetchBanners();
      setBusyBannerId(null);
      return;
    }

    setMessage({
      type: "success",
      text: nextExclusiveValue
        ? "Reklama u vendos si Exclusive."
        : "Reklama u hoq nga modaliteti Exclusive.",
    });

    setBusyBannerId(null);
    onBannersChanged?.();
  }

  async function deleteBanner(banner: Banner) {
    if (busyBannerId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `A je i sigurt që dëshiron ta fshish reklamën “${banner.title}”? Ky veprim nuk mund të kthehet prapa.`
    );

    if (!confirmed) {
      return;
    }

    setBusyBannerId(banner.id);
    setMessage(null);

    const { error } = await supabase
      .from("ad_banners")
      .delete()
      .eq("id", banner.id);

    if (error) {
      console.error("Banner delete error:", error);

      setMessage({
        type: "error",
        text: `Reklama nuk mund të fshihej: ${error.message}`,
      });

      setBusyBannerId(null);
      return;
    }

    setBanners((currentBanners) =>
      currentBanners.filter(
        (currentBanner) => currentBanner.id !== banner.id
      )
    );

    setMessage({
      type: "success",
      text: "Reklama u fshi me sukses.",
    });

    setBusyBannerId(null);
    onBannersChanged?.();
  }

  if (loading) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex min-h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-[#d41c3d]" />

            <p className="mt-4 text-sm font-bold text-gray-500">
              Duke ngarkuar reklamat...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-950">
            Reklamat e këtij pozicioni
          </h2>

          <p className="mt-1 text-sm font-medium text-gray-500">
            Gjithsej {banners.length}{" "}
            {banners.length === 1 ? "reklamë" : "reklama"}.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchBanners}
          disabled={busyBannerId !== null}
          className="w-fit rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-extrabold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Rifresko listën
        </button>
      </div>

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {banners.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
            📢
          </div>

          <h3 className="mt-4 text-lg font-extrabold text-gray-900">
            Nuk ka ende reklama
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-gray-500">
            Krijoje reklamën e parë për këtë pozicion duke përdorur formularin
            e reklamave.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              busy={busyBannerId === banner.id}
              onEdit={onEdit}
              onDelete={deleteBanner}
              onToggleActive={toggleBannerActive}
              onToggleExclusive={toggleBannerExclusive}
            />
          ))}
        </div>
      )}
    </section>
  );
}
