"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type BreakingSettings = {
  id: number;
  mode: "automatic" | "manual" | "off";
  manual_title: string | null;
  manual_link: string | null;
  duration_seconds: number | null;
  is_active: boolean;
};

export default function BreakingAdminPage() {
  const [settings, setSettings] = useState<BreakingSettings | null>(null);
  const [mode, setMode] = useState<"automatic" | "manual" | "off">("automatic");
  const [manualTitle, setManualTitle] = useState("");
  const [manualLink, setManualLink] = useState("");
  const [duration, setDuration] = useState<number | "unlimited">(10);
  const [loading, setLoading] = useState(false);

  async function fetchSettings() {
    const { data } = await supabase
      .from("breaking_settings")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setSettings(data);
      setMode(data.mode || "automatic");
      setManualTitle(data.manual_title || "");
      setManualLink(data.manual_link || "");
      setDuration(data.duration_seconds ?? "unlimited");
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function saveSettings() {
    setLoading(true);

    const payload = {
      mode,
      manual_title: manualTitle || null,
      manual_link: manualLink || null,
      duration_seconds: duration === "unlimited" ? null : duration,
      is_active: mode !== "off",
      updated_at: new Date().toISOString(),
    };

    if (settings) {
      await supabase.from("breaking_settings").update(payload).eq("id", settings.id);
    } else {
      await supabase.from("breaking_settings").insert(payload);
    }

    setLoading(false);
    fetchSettings();
    alert("Breaking News u ruajt me sukses.");
  }

  return (
    <div className="space-y-6 text-black">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-3xl font-extrabold text-black">
          Breaking News
        </h1>

        <p className="mb-6 text-gray-600">
          Automatic merr lajmet breaking ose 5 lajmet e fundit. Manual shfaq tekstin që vendos ti.
        </p>

        <div className="grid gap-4">
          <select
            value={mode}
            onChange={(e) =>
              setMode(e.target.value as "automatic" | "manual" | "off")
            }
            className="rounded border p-3 text-black"
          >
            <option value="automatic">Automatic - breaking ose 5 lajmet e fundit</option>
            <option value="manual">Manual - vendos vetë tekstin</option>
            <option value="off">Off - mos e shfaq</option>
          </select>

          {mode === "manual" && (
            <>
              <input
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Teksti i Breaking News"
                className="rounded border p-3 text-black placeholder:text-gray-400"
              />

              <input
                value={manualLink}
                onChange={(e) => setManualLink(e.target.value)}
                placeholder="Link opsional: /article/slug ose https://..."
                className="rounded border p-3 text-black placeholder:text-gray-400"
              />
            </>
          )}

          <select
            value={duration}
            onChange={(e) =>
              setDuration(
                e.target.value === "unlimited"
                  ? "unlimited"
                  : Number(e.target.value)
              )
            }
            className="rounded border p-3 text-black"
          >
            <option value="unlimited">Pa kufi / statik</option>
            <option value={5}>5 sekonda</option>
            <option value={10}>10 sekonda</option>
            <option value={15}>15 sekonda</option>
            <option value={20}>20 sekonda</option>
            <option value={30}>30 sekonda</option>
            <option value={40}>40 sekonda</option>
            <option value={60}>60 sekonda</option>
          </select>

          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-fit rounded bg-[#d41c3d] px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Duke ruajtur..." : "Ruaj Breaking Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}