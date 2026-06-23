"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

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
  is_archived: boolean;
  sort_order: number;
  expires_at: string | null;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [linkUrl, setLinkUrl] = useState("");
  const [campaignType, setCampaignType] = useState("MARKETING");
  const [durationSeconds, setDurationSeconds] = useState(10);
  const [isExclusive, setIsExclusive] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchCampaigns() {
    const { data } = await supabase
      .from("top_campaigns")
      .select("*")
      .order("is_archived", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data) setCampaigns(data);
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setMediaUrl("");
    setMediaType("image");
    setLinkUrl("");
    setCampaignType("MARKETING");
    setDurationSeconds(10);
    setIsExclusive(false);
    setExpiresAt("");
  }

  function startEdit(item: Campaign) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setMediaUrl(item.media_url || "");
    setMediaType(item.media_type || "image");
    setLinkUrl(item.link_url || "");
    setCampaignType(item.campaign_type || "MARKETING");
    setDurationSeconds(item.duration_seconds || 10);
    setIsExclusive(item.is_exclusive || false);
    setExpiresAt(item.expires_at ? item.expires_at.slice(0, 16) : "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveCampaign() {
    if (!title.trim()) {
      alert("Shkruaje titullin e kampanjës.");
      return;
    }

    setLoading(true);

    const payload = {
      title,
      description: description || null,
      media_url: mediaUrl || null,
      media_type: mediaType,
      link_url: linkUrl || null,
      campaign_type: campaignType,
      duration_seconds: durationSeconds,
      is_active: true,
      is_exclusive: isExclusive,
      expires_at: expiresAt || null,
    };

    if (editingId) {
      await supabase.from("top_campaigns").update(payload).eq("id", editingId);
    } else {
      await supabase.from("top_campaigns").insert({
        ...payload,
        is_archived: false,
        sort_order: campaigns.length + 1,
      });
    }

    setLoading(false);
    resetForm();
    fetchCampaigns();
  }

  async function toggleActive(id: number, isActive: boolean) {
    await supabase
      .from("top_campaigns")
      .update({ is_active: !isActive })
      .eq("id", id);

    fetchCampaigns();
  }

  async function toggleExclusive(id: number, isExclusive: boolean) {
    await supabase
      .from("top_campaigns")
      .update({ is_exclusive: !isExclusive })
      .eq("id", id);

    fetchCampaigns();
  }

  async function archiveCampaign(id: number) {
    await supabase
      .from("top_campaigns")
      .update({ is_archived: true, is_active: false })
      .eq("id", id);

    fetchCampaigns();
  }

  async function restoreCampaign(id: number) {
    await supabase
      .from("top_campaigns")
      .update({ is_archived: false })
      .eq("id", id);

    fetchCampaigns();
  }

  async function deleteCampaign(id: number) {
    const ok = confirm("A je i sigurt që do ta fshish këtë kampanjë?");
    if (!ok) return;

    await supabase.from("top_campaigns").delete().eq("id", id);
    fetchCampaigns();
  }

  return (
    <div className="space-y-6 text-black">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-3xl font-extrabold text-black">
          {editingId ? "Edito Campaign" : "Top Campaigns"}
        </h1>

        <p className="mb-6 text-gray-600">
          Menaxho reklamat/eventet që shfaqen në pjesën e sipërme të portalit.
        </p>

        <div className="grid gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulli i kampanjës"
            className="w-full rounded border p-3 text-black placeholder:text-gray-400"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Përshkrimi i shkurtër"
            className="h-24 w-full rounded border p-3 text-black placeholder:text-gray-400"
          />

          <input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Media URL: foto, GIF ose video"
            className="w-full rounded border p-3 text-black placeholder:text-gray-400"
          />

          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Link klikues: Facebook, Instagram, website..."
            className="w-full rounded border p-3 text-black placeholder:text-gray-400"
          />

          <div className="grid gap-4 md:grid-cols-3">
            <select
              value={campaignType}
              onChange={(e) => setCampaignType(e.target.value)}
              className="rounded border p-3 text-black"
            >
              <option value="MARKETING">MARKETING</option>
              <option value="EVENT">EVENT</option>
              <option value="NJOFTIM">NJOFTIM</option>
              <option value="LAJM EKSKLUZIV">LAJM EKSKLUZIV</option>
              <option value="SPORT">SPORT</option>
              <option value="LIVE">LIVE</option>
            </select>

            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="rounded border p-3 text-black"
            >
              <option value="image">Foto</option>
              <option value="gif">GIF</option>
              <option value="video">Video</option>
            </select>

            <select
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              className="rounded border p-3 text-black"
            >
              <option value={5}>5 sekonda</option>
              <option value={10}>10 sekonda</option>
              <option value={15}>15 sekonda</option>
              <option value={20}>20 sekonda</option>
              <option value={30}>30 sekonda</option>
              <option value={40}>40 sekonda</option>
              <option value={60}>60 sekonda</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded border p-3 font-bold">
              <input
                type="checkbox"
                checked={isExclusive}
                onChange={(e) => setIsExclusive(e.target.checked)}
              />
              Shfaq vetëm këtë kampanjë
            </label>

            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="rounded border p-3 text-black"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={saveCampaign}
              disabled={loading}
              className="w-fit rounded bg-[#d41c3d] px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {loading
                ? "Duke ruajtur..."
                : editingId
                ? "Ruaj ndryshimet"
                : "Shto Campaign"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded bg-gray-200 px-6 py-3 font-bold text-black"
              >
                Anulo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-extrabold">Campaigns</h2>

        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <p className="text-gray-500">Nuk ka ende kampanja.</p>
          ) : (
            campaigns.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-4 ${
                  item.is_archived ? "bg-gray-100 opacity-70" : "bg-white"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <span className="mb-2 inline-block rounded bg-[#d41c3d] px-2 py-1 text-xs font-bold text-white">
                      {item.campaign_type}
                    </span>

                    {item.is_archived && (
                      <span className="ml-2 rounded bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-700">
                        ARKIVUAR
                      </span>
                    )}

                    <h3 className="text-xl font-extrabold">{item.title}</h3>

                    {item.description && (
                      <p className="mt-1 text-gray-600">{item.description}</p>
                    )}

                    {item.media_url && (
                      <p className="mt-2 break-all text-sm text-blue-600">
                        Media: {item.media_url}
                      </p>
                    )}

                    {item.link_url && (
                      <p className="break-all text-sm text-blue-600">
                        Link: {item.link_url}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-gray-500">
                      {item.duration_seconds}s •{" "}
                      {item.is_active ? "Aktive" : "Jo aktive"} •{" "}
                      {item.is_exclusive ? "Exclusive" : "Rotation"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="rounded bg-blue-100 px-4 py-2 font-bold text-blue-700"
                    >
                      Edito
                    </button>

                    {!item.is_archived && (
                      <>
                        <button
                          onClick={() => toggleActive(item.id, item.is_active)}
                          className="rounded bg-gray-200 px-4 py-2 font-bold text-black"
                        >
                          {item.is_active ? "Çaktivizo" : "Aktivizo"}
                        </button>

                        <button
                          onClick={() =>
                            toggleExclusive(item.id, item.is_exclusive)
                          }
                          className="rounded bg-black px-4 py-2 font-bold text-white"
                        >
                          {item.is_exclusive ? "Hiq Exclusive" : "Exclusive"}
                        </button>

                        <button
                          onClick={() => archiveCampaign(item.id)}
                          className="rounded bg-yellow-100 px-4 py-2 font-bold text-yellow-700"
                        >
                          Arkivo
                        </button>
                      </>
                    )}

                    {item.is_archived && (
                      <button
                        onClick={() => restoreCampaign(item.id)}
                        className="rounded bg-green-100 px-4 py-2 font-bold text-green-700"
                      >
                        Rikthe
                      </button>
                    )}

                    <button
                      onClick={() => deleteCampaign(item.id)}
                      className="rounded bg-red-600 px-4 py-2 font-bold text-white"
                    >
                      Fshi
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}