"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

type Props = {
  position: string;
  value: string;
  onChange: (imageUrl: string) => void;
  disabled?: boolean;
};

type Message = {
  type: "success" | "error";
  text: string;
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function sanitizeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "jpg";

  const nameWithoutExtension = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ë/g, "e")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${nameWithoutExtension || "banner"}.${extension}`;
}

function extractStoragePath(imageUrl: string) {
  const marker = "/storage/v1/object/public/ad-banners/";

  if (!imageUrl.includes(marker)) {
    return null;
  }

  return decodeURIComponent(imageUrl.split(marker)[1]);
}

export default function ImageUploader({
  position,
  value,
  onChange,
  disabled = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  async function uploadFile(file: File) {
    if (disabled || uploading) {
      return;
    }

    setMessage(null);

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Formati nuk lejohet. Përdor JPG, PNG, WebP ose GIF.",
      });

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage({
        type: "error",
        text: "Fotografia është më e madhe se 8 MB.",
      });

      return;
    }

    setUploading(true);

    try {
      const safePosition = position
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");

      const safeFileName = sanitizeFileName(file.name);

      const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}-${safeFileName}`;

      const filePath = `${safePosition}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ad-banners")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from("ad-banners")
        .getPublicUrl(filePath);

      const uploadedImageUrl = publicUrlData.publicUrl;

      if (!uploadedImageUrl) {
        throw new Error("URL-ja e fotografisë nuk u krijua.");
      }

      setPreviewUrl(uploadedImageUrl);
      onChange(uploadedImageUrl);

      setMessage({
        type: "success",
        text: "Fotografia u ngarkua me sukses.",
      });
    } catch (error) {
      console.error("Image upload error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? `Fotografia nuk mund të ngarkohej: ${error.message}`
            : "Fotografia nuk mund të ngarkohej.",
      });
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      void uploadFile(selectedFile);
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!disabled && !uploading) {
      setDragging(true);
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    if (disabled || uploading) {
      return;
    }

    const droppedFile = event.dataTransfer.files?.[0];

    if (droppedFile) {
      void uploadFile(droppedFile);
    }
  }

  function openFilePicker() {
    if (disabled || uploading) {
      return;
    }

    fileInputRef.current?.click();
  }

  function removeFromForm() {
    if (disabled || uploading) {
      return;
    }

    setPreviewUrl("");
    onChange("");
    setMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function deleteFromStorage() {
    if (!previewUrl || disabled || uploading) {
      return;
    }

    const storagePath = extractStoragePath(previewUrl);

    if (!storagePath) {
      removeFromForm();
      return;
    }

    const confirmed = window.confirm(
      "A dëshiron ta fshish fotografinë edhe nga Storage? Ky veprim nuk mund të kthehet prapa."
    );

    if (!confirmed) {
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const { error } = await supabase.storage
        .from("ad-banners")
        .remove([storagePath]);

      if (error) {
        throw new Error(error.message);
      }

      setPreviewUrl("");
      onChange("");

      setMessage({
        type: "success",
        text: "Fotografia u fshi nga Storage.",
      });
    } catch (error) {
      console.error("Image delete error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? `Fotografia nuk mund të fshihej: ${error.message}`
            : "Fotografia nuk mund të fshihej.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-extrabold text-gray-900">
          Fotografia e reklamës
        </label>

        <p className="mt-1 text-xs font-medium leading-5 text-gray-500">
          Formatet e lejuara: JPG, PNG, WebP dhe GIF. Madhësia maksimale:
          8 MB.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInput}
        disabled={disabled || uploading}
        className="hidden"
      />

      {!previewUrl ? (
        <div
          role="button"
          tabIndex={disabled || uploading ? -1 : 0}
          onClick={openFilePicker}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openFilePicker();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging
              ? "border-[#d41c3d] bg-red-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
          } ${
            disabled || uploading
              ? "cursor-not-allowed opacity-60"
              : ""
          }`}
        >
          {uploading ? (
            <>
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#d41c3d]" />

              <p className="mt-4 text-sm font-extrabold text-gray-700">
                Duke ngarkuar fotografinë...
              </p>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-gray-200">
                ↑
              </div>

              <p className="mt-4 text-base font-extrabold text-gray-900">
                Kliko ose tërhiq fotografinë këtu
              </p>

              <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-gray-500">
                Zgjidhe fotografinë që do të përdoret për reklamën në këtë
                pozicion.
              </p>

              <span className="mt-5 rounded-xl bg-[#d41c3d] px-5 py-2.5 text-sm font-extrabold text-white">
                Zgjidh fotografinë
              </span>
            </>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="relative flex min-h-64 items-center justify-center bg-gray-100 p-4">
            <img
              src={previewUrl}
              alt="Pamja e reklamës"
              className="max-h-96 w-full object-contain"
            />

            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="text-center">
                  <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#d41c3d]" />

                  <p className="mt-3 text-sm font-extrabold text-gray-700">
                    Duke procesuar...
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 p-4 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={disabled || uploading}
              className="rounded-xl bg-[#d41c3d] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#b81734] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ndrysho fotografinë
            </button>

            <button
              type="button"
              onClick={removeFromForm}
              disabled={disabled || uploading}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-extrabold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Largoje nga formulari
            </button>

            <button
              type="button"
              onClick={deleteFromStorage}
              disabled={disabled || uploading}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-extrabold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto"
            >
              Fshije nga Storage
            </button>
          </div>
        </div>
      )}

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

      {previewUrl && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-extrabold uppercase tracking-wide text-gray-400">
            URL-ja e fotografisë
          </p>

          <p className="mt-1 break-all text-xs font-semibold leading-5 text-gray-600">
            {previewUrl}
          </p>
        </div>
      )}
    </div>
  );
}
