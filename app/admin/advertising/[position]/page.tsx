"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type Banner = {
  id?: number;
  title: string;
  position: string;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  desktop_height: number;
  mobile_height: number;
};

export default function AdvertisingPositionPage() {
  const params = useParams();
  const position = String(params.position);

  const [banner, setBanner] = useState<Banner>({
    title: "",
    position,
    image_url: null,
    link_url: "",
    is_active: true,
    desktop_height: 120,
    mobile_height: 80,
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBanner() {
      const { data } = await supabase
        .from("ad_banners")
        .select("*")
        .eq("position", position)
        .limit(1)
        .single();

      if (data) setBanner(data);
    }

    fetchBanner();
  }, [position]);

  async function saveBanner() {
    setLoading(true);

    let imageUrl = banner.image_url;

    if (file) {
      const filePath = `${position}/${Date.now()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
  .from("ad-banners")
  .upload(filePath, file, { upsert: true });

console.log("UPLOAD:", uploadData);
console.log("ERROR:", uploadError);

if (uploadError) {
  alert(uploadError.message);
  console.error(uploadError);
  setLoading(false);
  return;
}

      const { data } = supabase.storage
        .from("AD-BANNERS")
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const payload = {
      title: banner.title || `${position} banner`,
      position,
      image_url: imageUrl,
      link_url: banner.link_url || null,
      is_active: banner.is_active,
      desktop_height: banner.desktop_height,
      mobile_height: banner.mobile_height,
    };

    if (banner.id) {
      await supabase.from("ad_banners").update(payload).eq("id", banner.id);
    } else {
      await supabase.from("ad_banners").insert(payload);
    }

    setLoading(false);
    alert("Banneri u ruajt me sukses.");
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-[#d41c3d]">
          {position} Banner
        </h1>
        <p className="mt-2 text-gray-500">
          Upload, link dhe ON/OFF për këtë pozicion.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="mb-2 block font-bold">Titulli</label>
          <input
            value={banner.title}
            onChange={(e) => setBanner({ ...banner, title: e.target.value })}
            className="mb-4 w-full rounded border p-3"
            placeholder="P.sh. Foto Fari"
          />

          <label className="mb-2 block font-bold">Link URL</label>
          <input
            value={banner.link_url || ""}
            onChange={(e) => setBanner({ ...banner, link_url: e.target.value })}
            className="mb-4 w-full rounded border p-3"
            placeholder="https://..."
          />

          <label className="mb-2 block font-bold">Upload Banner</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4 w-full rounded border p-3"
          />

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-bold">Desktop height</label>
              <input
                type="number"
                value={banner.desktop_height}
                onChange={(e) =>
                  setBanner({ ...banner, desktop_height: Number(e.target.value) })
                }
                className="w-full rounded border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-bold">Mobile height</label>
              <input
                type="number"
                value={banner.mobile_height}
                onChange={(e) =>
                  setBanner({ ...banner, mobile_height: Number(e.target.value) })
                }
                className="w-full rounded border p-3"
              />
            </div>
          </div>

          <label className="mb-6 flex items-center gap-2 font-bold">
            <input
              type="checkbox"
              checked={banner.is_active}
              onChange={(e) =>
                setBanner({ ...banner, is_active: e.target.checked })
              }
            />
            Aktiv
          </label>

          <button
            onClick={saveBanner}
            disabled={loading}
            className="rounded bg-[#d41c3d] px-6 py-3 font-extrabold text-white disabled:opacity-60"
          >
            {loading ? "Duke ruajtur..." : "Ruaj Bannerin"}
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-extrabold">Preview</h2>

          {banner.image_url ? (
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full rounded-xl border object-cover"
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border bg-gray-50 text-gray-400">
              Nuk ka banner ende
            </div>
          )}
        </div>
      </div>
    </div>
  );
}