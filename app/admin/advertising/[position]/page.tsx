"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

const STORAGE_BUCKET = "ad-banners";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

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

type PageMessage = {
  type: "success" | "error";
  text: string;
};

function getDefaultHeights(position: string) {
  if (position === "sidebar") {
    return {
      desktop: 300,
      mobile: 250,
    };
  }

  if (position === "sticky-mobile") {
    return {
      desktop: 90,
      mobile: 80,
    };
  }

  return {
    desktop: 150,
    mobile: 90,
  };
}

function getSafeFileName(fileName: string) {
  const cleanName = fileName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");

  return cleanName || "banner-image";
}

export default function AdvertisingPositionPage() {
  const params = useParams();

  const position = useMemo(() => {
    const value = params?.position;

    if (Array.isArray(value)) {
      return value[0] || "";
    }

    return String(value || "");
  }, [params]);

  const defaultHeights = useMemo(
    () => getDefaultHeights(position),
    [position]
  );

  const [banner, setBanner] = useState<Banner>({
    title: "",
    position,
    image_url: null,
    link_url: "",
    is_active: true,
    desktop_height: defaultHeights.desktop,
    mobile_height: defaultHeights.mobile,
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<PageMessage | null>(null);

  useEffect(() => {
    if (!position) {
      return;
    }

    async function fetchBanner() {
      setFetching(true);
      setMessage(null);

      const { data, error } = await supabase
        .from("ad_banners")
        .select(
          "id, title, position, image_url, link_url, is_active, desktop_height, mobile_height"
        )
        .eq("position", position)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Fetch banner error:", error);

        setMessage({
          type: "error",
          text: `Banneri nuk mund të ngarkohej: ${error.message}`,
        });

        setFetching(false);
        return;
      }

      if (data) {
        setBanner({
          id: data.id,
          title: data.title || "",
          position: data.position || position,
          image_url: data.image_url || null,
          link_url: data.link_url || "",
          is_active: Boolean(data.is_active),
          desktop_height:
            Number(data.desktop_height) || defaultHeights.desktop,
          mobile_height:
            Number(data.mobile_height) || defaultHeights.mobile,
        });
      } else {
        setBanner({
          title: "",
          position,
          image_url: null,
          link_url: "",
          is_active: true,
          desktop_height: defaultHeights.desktop,
          mobile_height: defaultHeights.mobile,
        });
      }

      setFetching(false);
    }

    fetchBanner();
  }, [position, defaultHeights.desktop, defaultHeights.mobile]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    return () => {
      URL.revokeObjectURL(localPreviewUrl);
    };
  }, [file]);

  function handleFileChange(selectedFile: File | null) {
    setMessage(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Mund të ngarkosh vetëm fotografi.",
      });

      setFile(null);
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setMessage({
        type: "error",
        text: "Fotografia nuk mund të jetë më e madhe se 8 MB.",
      });

      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  async function uploadBannerImage() {
    if (!file) {
      return banner.image_url;
    }

    const safeFileName = getSafeFileName(file.name);
    const filePath = `${position}/${Date.now()}-${safeFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);

      throw new Error(
        `Upload-i në Storage dështoi: ${uploadError.message}`
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(uploadData.path);

    if (!publicUrlData.publicUrl) {
      throw new Error("Nuk u krijua URL-ja publike e bannerit.");
    }

    return publicUrlData.publicUrl;
  }

  async function saveBanner() {
    if (!position) {
      setMessage({
        type: "error",
        text: "Pozicioni i bannerit nuk është valid.",
      });

      return;
    }

    if (!banner.title.trim()) {
      setMessage({
        type: "error",
        text: "Shkruaje titullin e bannerit.",
      });

      return;
    }

    if (!banner.image_url && !file) {
      setMessage({
        type: "error",
        text: "Zgjidhe një fotografi për bannerin.",
      });

      return;
    }

    if (
      banner.link_url &&
      !/^https?:\/\//i.test(banner.link_url.trim())
    ) {
      setMessage({
        type: "error",
        text: "Linku duhet të fillojë me http:// ose https://",
      });

      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const imageUrl = await uploadBannerImage();

      const payload = {
        title: banner.title.trim(),
        position,
        image_url: imageUrl,
        link_url: banner.link_url?.trim() || null,
        is_active: banner.is_active,
        desktop_height:
          Number(banner.desktop_height) || defaultHeights.desktop,
        mobile_height:
          Number(banner.mobile_height) || defaultHeights.mobile,
      };

      let savedBanner: Banner | null = null;

      if (banner.id) {
        const { data, error } = await supabase
          .from("ad_banners")
          .update(payload)
          .eq("id", banner.id)
          .select(
            "id, title, position, image_url, link_url, is_active, desktop_height, mobile_height"
          )
          .single();

        if (error) {
          console.error("Update banner error:", error);
          throw new Error(`Ruajtja në databazë dështoi: ${error.message}`);
        }

        savedBanner = data as Banner;
      } else {
        const { data, error } = await supabase
          .from("ad_banners")
          .insert(payload)
          .select(
            "id, title, position, image_url, link_url, is_active, desktop_height, mobile_height"
          )
          .single();

        if (error) {
          console.error("Insert banner error:", error);
          throw new Error(`Ruajtja në databazë dështoi: ${error.message}`);
        }

        savedBanner = data as Banner;
      }

      if (!savedBanner) {
        throw new Error("Banneri u ruajt, por nuk u kthye nga databaza.");
      }

      setBanner({
        ...savedBanner,
        link_url: savedBanner.link_url || "",
      });

      setFile(null);

      setMessage({
        type: "success",
        text: "Banneri u ruajt me sukses.",
      });
    } catch (error) {
      console.error("Save banner error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Ndodhi një gabim gjatë ruajtjes.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function removeBannerImage() {
    setMessage(null);

    if (!banner.image_url) {
      return;
    }

    setBanner((currentBanner) => ({
      ...currentBanner,
      image_url: null,
    }));

    setFile(null);

    setMessage({
      type: "success",
      text: "Fotografia u largua nga formulari. Kliko “Ruaj Bannerin” për ta konfirmuar.",
    });
  }

  const visiblePreviewUrl = previewUrl || banner.image_url;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold capitalize text-[#d41c3d]">
          {position.replaceAll("-", " ")} Banner
        </h1>

        <p className="mt-2 text-gray-500">
          Menaxho fotografinë, linkun, dimensionet dhe statusin e këtij
          pozicioni reklamues.
        </p>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {fetching ? (
            <div className="flex min-h-72 items-center justify-center text-gray-400">
              Duke ngarkuar bannerin...
            </div>
          ) : (
            <>
              <label className="mb-2 block font-bold">Titulli</label>

              <input
                value={banner.title}
                onChange={(event) =>
                  setBanner((currentBanner) => ({
                    ...currentBanner,
                    title: event.target.value,
                  }))
                }
                className="mb-4 w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-[#d41c3d]"
                placeholder="P.sh. Foto Fari"
              />

              <label className="mb-2 block font-bold">Link URL</label>

              <input
                type="url"
                value={banner.link_url || ""}
                onChange={(event) =>
                  setBanner((currentBanner) => ({
                    ...currentBanner,
                    link_url: event.target.value,
                  }))
                }
                className="mb-4 w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-[#d41c3d]"
                placeholder="https://..."
              />

              <label className="mb-2 block font-bold">Upload Banner</label>

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] || null)
                }
                className="mb-2 w-full rounded-lg border border-gray-300 p-3"
              />

              <p className="mb-4 text-xs text-gray-500">
                Formate të lejuara: JPG, PNG, WEBP. Madhësia maksimale: 8 MB.
              </p>

              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-bold">
                    Desktop height
                  </label>

                  <input
                    type="number"
                    min={40}
                    max={1000}
                    value={banner.desktop_height}
                    onChange={(event) =>
                      setBanner((currentBanner) => ({
                        ...currentBanner,
                        desktop_height: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-[#d41c3d]"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-bold">
                    Mobile height
                  </label>

                  <input
                    type="number"
                    min={40}
                    max={1000}
                    value={banner.mobile_height}
                    onChange={(event) =>
                      setBanner((currentBanner) => ({
                        ...currentBanner,
                        mobile_height: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 outline-none transition focus:border-[#d41c3d]"
                  />
                </div>
              </div>

              <label className="mb-6 flex items-center gap-2 font-bold">
                <input
                  type="checkbox"
                  checked={banner.is_active}
                  onChange={(event) =>
                    setBanner((currentBanner) => ({
                      ...currentBanner,
                      is_active: event.target.checked,
                    }))
                  }
                />
                Aktiv
              </label>

              <button
                type="button"
                onClick={saveBanner}
                disabled={loading}
                className="rounded-lg bg-[#d41c3d] px-6 py-3 font-extrabold text-white transition hover:bg-[#b91935] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Duke ruajtur..." : "Ruaj Bannerin"}
              </button>
            </>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold">Preview</h2>

            {visiblePreviewUrl && (
              <button
                type="button"
                onClick={removeBannerImage}
                className="text-sm font-bold text-red-600 hover:underline"
              >
                Largo fotografinë
              </button>
            )}
          </div>

          {visiblePreviewUrl ? (
            <div
              className="overflow-hidden rounded-xl border bg-gray-50"
              style={{
                height: `${banner.desktop_height || defaultHeights.desktop}px`,
              }}
            >
              <img
                src={visiblePreviewUrl}
                alt={banner.title || "Banner"}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-xl border bg-gray-50 text-gray-400">
              Nuk ka banner ende
            </div>
          )}

          {file && (
            <p className="mt-3 text-sm text-gray-500">
              Fotografia e zgjedhur:{" "}
              <span className="font-semibold">{file.name}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}