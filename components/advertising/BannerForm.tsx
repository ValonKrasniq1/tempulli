"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Banner } from "./BannerCard";
import ImageUploader from "./ImageUploader";

type Props = {
  position: string;
  editingBanner: Banner | null;
  onSaved: () => void;
  onCancelEdit: () => void;
};

type Message = {
  type: "success" | "error";
  text: string;
};

type FormState = {
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  isExclusive: boolean;
  durationSeconds: number;
  sortOrder: number;
  desktopHeight: number;
  mobileHeight: number;
  startDate: string;
  endDate: string;
};

type PositionDefaults = {
  desktopHeight: number;
  mobileHeight: number;
};

const DURATION_OPTIONS = [3, 5, 10, 15, 20, 30, 45, 60];

const POSITION_DEFAULTS: Record<string, PositionDefaults> = {
  campaign: {
    desktopHeight: 120,
    mobileHeight: 200,
  },

  billboard: {
    desktopHeight: 200,
    mobileHeight: 300,
  },

  hero: {
    desktopHeight: 200,
    mobileHeight: 300,
  },

  "latest-news": {
    desktopHeight: 250,
    mobileHeight: 300,
  },

  sidebar: {
    desktopHeight: 600,
    mobileHeight: 600,
  },

  footer: {
    desktopHeight: 200,
    mobileHeight: 300,
  },

  "sticky-mobile": {
    desktopHeight: 0,
    mobileHeight: 100,
  },
};

function getPositionDefaults(position: string): PositionDefaults {
  return (
    POSITION_DEFAULTS[position] || {
      desktopHeight: 200,
      mobileHeight: 300,
    }
  );
}

function createInitialForm(position: string): FormState {
  const defaults = getPositionDefaults(position);

  return {
    title: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    isExclusive: false,
    durationSeconds: 10,
    sortOrder: 0,
    desktopHeight: defaults.desktopHeight,
    mobileHeight: defaults.mobileHeight,
    startDate: "",
    endDate: "",
  };
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function toDatabaseDate(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function normalizeLinkUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  if (
    trimmedValue.startsWith("http://") ||
    trimmedValue.startsWith("https://")
  ) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

export default function BannerForm({
  position,
  editingBanner,
  onSaved,
  onCancelEdit,
}: Props) {
  const defaults = useMemo(
    () => getPositionDefaults(position),
    [position]
  );

  const [form, setForm] = useState<FormState>(() =>
    createInitialForm(position)
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const isEditing = Boolean(editingBanner);

  useEffect(() => {
    setMessage(null);

    if (editingBanner) {
      setForm({
        title: editingBanner.title || "",
        imageUrl: editingBanner.image_url || "",
        linkUrl: editingBanner.link_url || "",
        isActive: editingBanner.is_active,
        isExclusive: editingBanner.is_exclusive,
        durationSeconds: editingBanner.duration_seconds || 10,
        sortOrder: editingBanner.sort_order || 0,
        desktopHeight:
          editingBanner.desktop_height ?? defaults.desktopHeight,
        mobileHeight:
          editingBanner.mobile_height ?? defaults.mobileHeight,
        startDate: toDateTimeLocalValue(editingBanner.start_date),
        endDate: toDateTimeLocalValue(editingBanner.end_date),
      });

      return;
    }

    setForm(createInitialForm(position));
  }, [defaults.desktopHeight, defaults.mobileHeight, editingBanner, position]);

  function updateForm<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(createInitialForm(position));
    setMessage(null);
    onCancelEdit();
  }

  function validateForm() {
    if (!form.title.trim()) {
      return "Shkruaje titullin e reklamës.";
    }

    if (!form.imageUrl.trim()) {
      return "Ngarko fotografinë e reklamës.";
    }

    if (!DURATION_OPTIONS.includes(form.durationSeconds)) {
      return "Zgjidhe një kohë të vlefshme të rotacionit.";
    }

    if (form.sortOrder < 0) {
      return "Renditja nuk mund të jetë numër negativ.";
    }

    if (form.desktopHeight < 0 || form.mobileHeight < 0) {
      return "Lartësia nuk mund të jetë numër negativ.";
    }

    if (
      position !== "sticky-mobile" &&
      (form.desktopHeight < 40 || form.desktopHeight > 1200)
    ) {
      return "Lartësia për desktop duhet të jetë ndërmjet 40 dhe 1200 px.";
    }

    if (form.mobileHeight < 40 || form.mobileHeight > 1200) {
      return "Lartësia për mobile duhet të jetë ndërmjet 40 dhe 1200 px.";
    }

    if (form.startDate && form.endDate) {
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);

      if (endDate <= startDate) {
        return "Data e përfundimit duhet të jetë pas datës së fillimit.";
      }
    }

    if (form.linkUrl.trim()) {
      try {
        new URL(normalizeLinkUrl(form.linkUrl) || "");
      } catch {
        return "Linku i reklamës nuk është i vlefshëm.";
      }
    }

    return null;
  }

  async function disableOtherExclusiveBanners() {
    if (!form.isExclusive) {
      return;
    }

    let query = supabase
      .from("ad_banners")
      .update({
        is_exclusive: false,
        updated_at: new Date().toISOString(),
      })
      .eq("position", position)
      .eq("is_exclusive", true);

    if (editingBanner) {
      query = query.neq("id", editingBanner.id);
    }

    const { error } = await query;

    if (error) {
      throw new Error(
        `Reklamat e tjera Exclusive nuk mund të përditësoheshin: ${error.message}`
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setMessage(null);

    const validationError = validateForm();

    if (validationError) {
      setMessage({
        type: "error",
        text: validationError,
      });

      return;
    }

    setSaving(true);

    try {
      await disableOtherExclusiveBanners();

      const bannerData = {
        title: form.title.trim(),
        position,
        image_url: form.imageUrl.trim(),
        link_url: normalizeLinkUrl(form.linkUrl),
        is_active: form.isActive,
        is_exclusive: form.isExclusive,
        duration_seconds: form.durationSeconds,
        sort_order: form.sortOrder,
        desktop_height: form.desktopHeight,
        mobile_height: form.mobileHeight,
        start_date: toDatabaseDate(form.startDate),
        end_date: toDatabaseDate(form.endDate),
        updated_at: new Date().toISOString(),
      };

      if (editingBanner) {
        const { error } = await supabase
          .from("ad_banners")
          .update(bannerData)
          .eq("id", editingBanner.id);

        if (error) {
          throw new Error(error.message);
        }

        setMessage({
          type: "success",
          text: "Reklama u përditësua me sukses.",
        });
      } else {
        const { error } = await supabase
          .from("ad_banners")
          .insert({
            ...bannerData,
            created_at: new Date().toISOString(),
          });

        if (error) {
          throw new Error(error.message);
        }

        setMessage({
          type: "success",
          text: "Reklama u krijua me sukses.",
        });
      }

      setForm(createInitialForm(position));
      onCancelEdit();
      onSaved();
    } catch (error) {
      console.error("Banner save error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? `Reklama nuk mund të ruhej: ${error.message}`
            : "Reklama nuk mund të ruhej.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      id="banner-form"
      className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
    >
      <div className="border-b border-gray-100 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#d41c3d]">
              {isEditing ? "Editimi i reklamës" : "Reklamë e re"}
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
              {isEditing
                ? `Ndrysho: ${editingBanner?.title}`
                : "Shto një reklamë"}
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
              Plotëso të dhënat, ngarko fotografinë dhe cakto mënyrën e
              shfaqjes së reklamës.
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="w-fit rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-extrabold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anulo editimin
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 p-6">
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
          <FormField
            label="Titulli i reklamës"
            description="Ky titull përdoret vetëm në panelin e administrimit."
          >
            <input
              type="text"
              value={form.title}
              onChange={(event) =>
                updateForm("title", event.target.value)
              }
              placeholder="P.sh. Valoni Petrol – Oferta Verore"
              disabled={saving}
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="Linku i reklamës"
            description="Kur vizitori klikon reklamën, dërgohet në këtë adresë."
          >
            <input
              type="text"
              value={form.linkUrl}
              onChange={(event) =>
                updateForm("linkUrl", event.target.value)
              }
              placeholder="https://shembull.com"
              disabled={saving}
              className={inputClassName}
            />
          </FormField>
        </div>

        <ImageUploader
          position={position}
          value={form.imageUrl}
          onChange={(imageUrl) => updateForm("imageUrl", imageUrl)}
          disabled={saving}
        />

        <div className="border-t border-gray-100 pt-8">
          <div>
            <h3 className="text-lg font-extrabold text-gray-950">
              Cilësimet e shfaqjes
            </h3>

            <p className="mt-1 text-sm font-medium text-gray-500">
              Cakto rotacionin, renditjen dhe lartësinë e reklamës.
            </p>
          </div>

          <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <FormField
              label="Kohëzgjatja"
              description="Sa sekonda shfaqet para reklamës tjetër."
            >
              <select
                value={form.durationSeconds}
                onChange={(event) =>
                  updateForm(
                    "durationSeconds",
                    Number(event.target.value)
                  )
                }
                disabled={saving}
                className={inputClassName}
              >
                {DURATION_OPTIONS.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration} sekonda
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Renditja"
              description="Numri më i vogël shfaqet i pari."
            >
              <input
                type="number"
                min="0"
                step="1"
                value={form.sortOrder}
                onChange={(event) =>
                  updateForm(
                    "sortOrder",
                    Number(event.target.value)
                  )
                }
                disabled={saving}
                className={inputClassName}
              />
            </FormField>

            <FormField
              label="Lartësia desktop"
              description={
                position === "sticky-mobile"
                  ? "Sticky Mobile nuk shfaqet në desktop."
                  : "Lartësia e reklamës në desktop, në px."
              }
            >
              <div className="relative">
                <input
                  type="number"
                  min={position === "sticky-mobile" ? 0 : 40}
                  max="1200"
                  step="1"
                  value={form.desktopHeight}
                  onChange={(event) =>
                    updateForm(
                      "desktopHeight",
                      Number(event.target.value)
                    )
                  }
                  disabled={saving || position === "sticky-mobile"}
                  className={`${inputClassName} pr-12`}
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  px
                </span>
              </div>
            </FormField>

            <FormField
              label="Lartësia mobile"
              description="Lartësia e reklamës në telefon, në px."
            >
              <div className="relative">
                <input
                  type="number"
                  min="40"
                  max="1200"
                  step="1"
                  value={form.mobileHeight}
                  onChange={(event) =>
                    updateForm(
                      "mobileHeight",
                      Number(event.target.value)
                    )
                  }
                  disabled={saving}
                  className={`${inputClassName} pr-12`}
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                  px
                </span>
              </div>
            </FormField>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <div>
            <h3 className="text-lg font-extrabold text-gray-950">
              Kohëzgjatja e fushatës
            </h3>

            <p className="mt-1 text-sm font-medium text-gray-500">
              Mund ta lësh pa data që reklama të mos ketë afat.
            </p>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <FormField
              label="Data dhe ora e fillimit"
              description="Reklama nuk shfaqet para kësaj date."
            >
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(event) =>
                  updateForm("startDate", event.target.value)
                }
                disabled={saving}
                className={inputClassName}
              />
            </FormField>

            <FormField
              label="Data dhe ora e përfundimit"
              description="Reklama nuk shfaqet pas kësaj date."
            >
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(event) =>
                  updateForm("endDate", event.target.value)
                }
                disabled={saving}
                className={inputClassName}
              />
            </FormField>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <div>
            <h3 className="text-lg font-extrabold text-gray-950">
              Statusi dhe modaliteti
            </h3>

            <p className="mt-1 text-sm font-medium text-gray-500">
              Kontrollo nëse reklama është aktive dhe nëse duhet të shfaqet
              vetë.
            </p>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <ToggleCard
              title="Reklama aktive"
              description="Kur është OFF, reklama ruhet por nuk shfaqet në portal."
              enabled={form.isActive}
              onToggle={() =>
                updateForm("isActive", !form.isActive)
              }
              disabled={saving}
              enabledLabel="ACTIVE"
              disabledLabel="INACTIVE"
            />

            <ToggleCard
              title="Modaliteti Exclusive"
              description="Kur është ON, kjo reklamë shfaqet vetë dhe rotacioni ndalet."
              enabled={form.isExclusive}
              onToggle={() =>
                updateForm("isExclusive", !form.isExclusive)
              }
              disabled={saving}
              enabledLabel="EXCLUSIVE"
              disabledLabel="ROTACION"
              warning
            />
          </div>

          {form.isExclusive && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-bold leading-6 text-amber-800">
                Kur ta ruash këtë reklamë si Exclusive, modaliteti Exclusive
                do të hiqet automatikisht nga reklamat e tjera të këtij
                pozicioni.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-extrabold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anulo
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#d41c3d] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#b81734] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Duke ruajtur..."
              : isEditing
                ? "Ruaj ndryshimet"
                : "Krijo reklamën"}
          </button>
        </div>
      </form>
    </section>
  );
}

const inputClassName =
  "h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#d41c3d] focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500";

function FormField({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-extrabold text-gray-900">
        {label}
      </label>

      {description && (
        <p className="mt-1 min-h-10 text-xs font-medium leading-5 text-gray-500">
          {description}
        </p>
      )}

      <div className={description ? "mt-2" : "mt-3"}>
        {children}
      </div>
    </div>
  );
}

function ToggleCard({
  title,
  description,
  enabled,
  onToggle,
  disabled,
  enabledLabel,
  disabledLabel,
  warning = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled: boolean;
  enabledLabel: string;
  disabledLabel: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-5 rounded-2xl border p-5 ${
        enabled
          ? warning
            ? "border-amber-300 bg-amber-50"
            : "border-green-300 bg-green-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-extrabold text-gray-950">
            {title}
          </h4>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
              enabled
                ? warning
                  ? "bg-amber-200 text-amber-900"
                  : "bg-green-200 text-green-800"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {enabled ? enabledLabel : disabledLabel}
          </span>
        </div>

        <p className="mt-2 max-w-md text-xs font-medium leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={enabled ? `Çaktivizo ${title}` : `Aktivizo ${title}`}
        className={`relative h-8 w-14 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
          enabled
            ? warning
              ? "bg-amber-500"
              : "bg-green-500"
            : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
