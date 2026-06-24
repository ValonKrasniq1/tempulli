"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Billboard = {
  id: number;
  title: string;
  media_url: string | null;
  media_type: string;
  link_url: string | null;
  duration_seconds: number;
  is_active: boolean;
  is_archived: boolean;
  sort_order: number;
};

export default function BillboardPage() {
  const [ads, setAds] = useState<Billboard[]>([]);
  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [linkUrl, setLinkUrl] = useState("");
  const [duration, setDuration] = useState(10);
  const [uploading, setUploading] = useState(false);

  async function fetchAds() {
    const { data } = await supabase
      .from("billboard_ads")
      .select("*")
      .eq("is_archived", false)
      .order("sort_order", { ascending: true });

    if (data) setAds(data);
  }

  useEffect(() => {
    fetchAds();
  }, []);

  async function uploadFile(file: File) {
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `billboards/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("news-images")
      .upload(fileName, file);

    if (error) {
      alert("Upload dështoi.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("news-images")
      .getPublicUrl(fileName);

    setMediaUrl(data.publicUrl);

    if (file.type.includes("video")) setMediaType("video");
    else if (file.type.includes("gif")) setMediaType("gif");
    else setMediaType("image");

    setUploading(false);
  }

  async function addAd() {
    if (!title.trim()) {
      alert("Shkruaje titullin.");
      return;
    }

    await supabase.from("billboard_ads").insert({
      title,
      media_url: mediaUrl || null,
      media_type: mediaType,
      link_url: linkUrl || null,
      duration_seconds: duration,
      is_active: true,
      sort_order: ads.length + 1,
    });

    setTitle("");
    setMediaUrl("");
    setMediaType("image");
    setLinkUrl("");
    setDuration(10);

    fetchAds();
  }

  async function toggleActive(id: number, active: boolean) {
    await supabase
      .from("billboard_ads")
      .update({ is_active: !active })
      .eq("id", id);

    fetchAds();
  }

  async function archiveAd(id: number) {
    await supabase
      .from("billboard_ads")
      .update({ is_archived: true })
      .eq("id", id);

    fetchAds();
  }

  async function deleteAd(id: number) {
    if (!confirm("Fshi reklamën?")) return;

    await supabase.from("billboard_ads").delete().eq("id", id);
    fetchAds();
  }

  return (
    <div className="space-y-6 text-black">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="mb-4 text-3xl font-bold">Billboard Ads 970x250</h1>

        <div className="grid gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titulli"
            className="rounded border p-3 text-black"
          />

          <input
            type="file"
            accept="image/*,video/mp4,video/webm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
            }}
            className="rounded border p-3 text-black"
          />

          {uploading && <p className="text-sm text-gray-500">Duke u ngarkuar...</p>}

          {mediaUrl && (
            <div className="rounded border p-3">
              <p className="mb-2 text-sm font-bold">Preview:</p>

              {mediaType === "video" ? (
                <video
                  src={mediaUrl}
                  controls
                  className="h-[160px] w-full rounded object-cover"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="h-[160px] w-full rounded object-cover"
                />
              )}
            </div>
          )}

          <input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Ose vendos Media URL manualisht"
            className="rounded border p-3 text-black"
          />

          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Link klikues"
            className="rounded border p-3 text-black"
          />

          <div className="grid gap-4 md:grid-cols-2">
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
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
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

          <button
            onClick={addAd}
            disabled={uploading}
            className="w-fit rounded bg-[#d41c3d] px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            Shto Billboard
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-bold">Billboard aktive</h2>

        <div className="space-y-3">
          {ads.map((item) => (
            <div key={item.id} className="rounded border p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    {item.duration_seconds}s • {item.is_active ? "Aktive" : "Jo aktive"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(item.id, item.is_active)}
                    className="rounded bg-gray-200 px-4 py-2 font-bold"
                  >
                    {item.is_active ? "Çaktivizo" : "Aktivizo"}
                  </button>

                  <button
                    onClick={() => archiveAd(item.id)}
                    className="rounded bg-black px-4 py-2 font-bold text-white"
                  >
                    Arkivo
                  </button>

                  <button
                    onClick={() => deleteAd(item.id)}
                    className="rounded bg-red-600 px-4 py-2 font-bold text-white"
                  >
                    Fshi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}