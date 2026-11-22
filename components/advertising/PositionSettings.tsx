"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Props = {
  position: string;
};

type AdPosition = {
  id: number;
  position: string;
  title: string;
  is_enabled: boolean;
  sort_order: number;
};

type BannerStats = {
  total: number;
  active: number;
  exclusive: number;
};

type Message = {
  type: "success" | "error";
  text: string;
};

type PositionInformation = {
  title: string;
  desktopSize: string;
  mobileSize: string;
  description: string;
};

const POSITION_INFORMATION: Record<string, PositionInformation> = {
  campaign: {
    title: "Campaign Banner",
    desktopSize: "1800 × 120 px",
    mobileSize: "1080 × 200 px",
    description:
      "Shfaqet në pjesën e sipërme të portalit, para header-it kryesor.",
  },

  billboard: {
    title: "Billboard Banner",
    desktopSize: "1800 × 200 px",
    mobileSize: "1080 × 300 px",
    description:
      "Shfaqet poshtë Breaking News dhe para seksionit kryesor Hero.",
  },

  hero: {
    title: "Hero Banner",
    desktopSize: "1800 × 200 px",
    mobileSize: "1080 × 300 px",
    description:
      "Shfaqet menjëherë poshtë seksionit kryesor Hero.",
  },

  "latest-news": {
    title: "Latest News Banner",
    desktopSize: "1200 × 250 px",
    mobileSize: "1080 × 300 px",
    description:
      "Shfaqet në kolonën e lajmeve të fundit.",
  },

  sidebar: {
    title: "Sidebar Banner",
    desktopSize: "600 × 600 px",
    mobileSize: "1080 × 1080 px",
    description:
      "Shfaqet në anën e djathtë të portalit, poshtë lajmeve më të lexuara.",
  },

  "sticky-mobile": {
    title: "Sticky Mobile Banner",
    desktopSize: "Nuk shfaqet në desktop",
    mobileSize: "1080 × 200 px",
    description:
      "Shfaqet vetëm në telefon dhe qëndron i fiksuar në fund të ekranit.",
  },

  footer: {
    title: "Footer Banner",
    desktopSize: "1800 × 200 px",
    mobileSize: "1080 × 300 px",
    description:
      "Shfaqet në fund të faqes, menjëherë para footer-it.",
  },
};

function getPositionInformation(position: string): PositionInformation {
  return (
    POSITION_INFORMATION[position] || {
      title: `${position.replaceAll("-", " ")} Banner`,
      desktopSize: "1800 × 200 px",
      mobileSize: "1080 × 300 px",
      description: "Pozicion reklamues në portal.",
    }
  );
}

export default function PositionSettings({ position }: Props) {
  const information = useMemo(
    () => getPositionInformation(position),
    [position]
  );

  const [positionData, setPositionData] = useState<AdPosition | null>(null);

  const [stats, setStats] = useState<BannerStats>({
    total: 0,
    active: 0,
    exclusive: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const fetchPositionSettings = useCallback(async () => {
    if (!position) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const [positionResult, bannersResult] = await Promise.all([
        supabase
          .from("ad_positions")
          .select("id, position, title, is_enabled, sort_order")
          .eq("position", position)
          .maybeSingle(),

        supabase
          .from("ad_banners")
          .select("id, is_active, is_exclusive")
          .eq("position", position),
      ]);

      if (positionResult.error) {
        throw new Error(
          `Pozicioni nuk mund të ngarkohej: ${positionResult.error.message}`
        );
      }

      if (bannersResult.error) {
        throw new Error(
          `Reklamat nuk mund të ngarkoheshin: ${bannersResult.error.message}`
        );
      }

      if (positionResult.data) {
        setPositionData(positionResult.data as AdPosition);
      } else {
        const { data: createdPosition, error: createError } = await supabase
          .from("ad_positions")
          .insert({
            position,
            title: information.title,
            is_enabled: true,
            sort_order: 0,
          })
          .select("id, position, title, is_enabled, sort_order")
          .single();

        if (createError) {
          throw new Error(
            `Pozicioni nuk mund të krijohej: ${createError.message}`
          );
        }

        setPositionData(createdPosition as AdPosition);
      }

      const banners = bannersResult.data || [];

      setStats({
        total: banners.length,
        active: banners.filter((banner) => banner.is_active).length,
        exclusive: banners.filter(
          (banner) => banner.is_active && banner.is_exclusive
        ).length,
      });
    } catch (error) {
      console.error("PositionSettings fetch error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Ndodhi një gabim gjatë ngarkimit të pozicionit.",
      });
    } finally {
      setLoading(false);
    }
  }, [information.title, position]);

  useEffect(() => {
    fetchPositionSettings();
  }, [fetchPositionSettings]);

  async function togglePosition() {
    if (!positionData || saving) {
      return;
    }

    const previousValue = positionData.is_enabled;
    const newValue = !previousValue;

    setSaving(true);
    setMessage(null);

    setPositionData((currentPosition) =>
      currentPosition
        ? {
            ...currentPosition,
            is_enabled: newValue,
          }
        : currentPosition
    );

    const { error } = await supabase
      .from("ad_positions")
      .update({
        is_enabled: newValue,
      })
      .eq("id", positionData.id);

    if (error) {
      console.error("Position toggle error:", error);

      setPositionData((currentPosition) =>
        currentPosition
          ? {
              ...currentPosition,
              is_enabled: previousValue,
            }
          : currentPosition
      );

      setMessage({
        type: "error",
        text: `Statusi nuk mund të ndryshohej: ${error.message}`,
      });

      setSaving(false);
      return;
    }

    setMessage({
      type: "success",
      text: newValue
        ? "Pozicioni u aktivizua me sukses."
        : "Pozicioni u çaktivizua dhe nuk do të shfaqet në portal.",
    });

    setSaving(false);
  }

  if (loading) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex min-h-52 items-center justify-center">
          <p className="text-sm font-semibold text-gray-400">
            Duke ngarkuar cilësimet e pozicionit...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
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

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-col gap-5 border-b border-gray-100 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-gray-950">
                {positionData?.title || information.title}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                  positionData?.is_enabled
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {positionData?.is_enabled ? "POSITION ON" : "POSITION OFF"}
              </span>
            </div>

            <p className="max-w-2xl text-sm font-medium leading-6 text-gray-500">
              {information.description}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-gray-400">
                Shfaqja në portal
              </p>

              <p className="mt-1 text-sm font-extrabold text-gray-800">
                {positionData?.is_enabled ? "Aktive" : "E çaktivizuar"}
              </p>
            </div>

            <button
              type="button"
              onClick={togglePosition}
              disabled={!positionData || saving}
              aria-label={
                positionData?.is_enabled
                  ? "Çaktivizo pozicionin"
                  : "Aktivizo pozicionin"
              }
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                positionData?.is_enabled
                  ? "bg-green-500"
                  : "bg-gray-300"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${
                  positionData?.is_enabled ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-5">
          <InformationCard
            label="Desktop"
            value={information.desktopSize}
          />

          <InformationCard
            label="Mobile"
            value={information.mobileSize}
          />

          <InformationCard
            label="Total reklama"
            value={stats.total}
          />

          <InformationCard
            label="Reklama aktive"
            value={stats.active}
            highlight={stats.active > 0}
          />

          <InformationCard
            label="Exclusive aktive"
            value={stats.exclusive}
            warning={stats.exclusive > 0}
          />
        </div>

        {!positionData?.is_enabled && (
          <div className="border-t border-red-100 bg-red-50 px-6 py-4">
            <p className="text-sm font-bold text-red-700">
              Ky pozicion është OFF. Asnjë reklamë e këtij pozicioni nuk
              duhet të shfaqet në portal, edhe nëse reklamat individuale janë
              aktive.
            </p>
          </div>
        )}

        {stats.exclusive > 1 && (
          <div className="border-t border-amber-100 bg-amber-50 px-6 py-4">
            <p className="text-sm font-bold text-amber-800">
              Kujdes: Ka më shumë se një reklamë Exclusive aktive. Duhet të
              mbetet vetëm një reklamë Exclusive aktive në këtë pozicion.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function InformationCard({
  label,
  value,
  highlight = false,
  warning = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  warning?: boolean;
}) {
  let valueClassName = "text-gray-950";

  if (highlight) {
    valueClassName = "text-green-700";
  }

  if (warning) {
    valueClassName = "text-amber-700";
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className={`mt-2 text-lg font-extrabold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}
