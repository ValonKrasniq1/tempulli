"use client";

type Banner = {
  id: number;
  title: string;
  position: string;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  is_exclusive: boolean;
  duration_seconds: number;
  sort_order: number;
  desktop_height: number;
  mobile_height: number;
  start_date: string | null;
  end_date: string | null;
};

type Props = {
  banner: Banner;
  busy?: boolean;
  onEdit: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onToggleActive: (banner: Banner) => void;
  onToggleExclusive: (banner: Banner) => void;
};

function formatDate(date: string | null) {
  if (!date) {
    return "Pa kufizim";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function getScheduleStatus(banner: Banner) {
  const now = new Date();
  const startDate = banner.start_date
    ? new Date(banner.start_date)
    : null;
  const endDate = banner.end_date
    ? new Date(banner.end_date)
    : null;

  if (startDate && startDate > now) {
    return {
      label: "E planifikuar",
      className: "bg-blue-100 text-blue-700",
    };
  }

  if (endDate && endDate < now) {
    return {
      label: "E përfunduar",
      className: "bg-gray-200 text-gray-600",
    };
  }

  return {
    label: "Brenda afatit",
    className: "bg-green-100 text-green-700",
  };
}

export type { Banner };

export default function BannerCard({
  banner,
  busy = false,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleExclusive,
}: Props) {
  const scheduleStatus = getScheduleStatus(banner);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <div className="relative min-h-52 overflow-hidden bg-gray-100">
          {banner.image_url ? (
            <img
              src={banner.image_url}
              alt={banner.title || "Reklamë"}
              className="h-full min-h-52 w-full object-contain"
            />
          ) : (
            <div className="flex min-h-52 items-center justify-center px-6 text-center text-sm font-bold text-gray-400">
              Nuk ka fotografi
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold shadow-sm ${
                banner.is_active
                  ? "bg-green-500 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              {banner.is_active ? "ACTIVE" : "INACTIVE"}
            </span>

            {banner.is_exclusive && (
              <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950 shadow-sm">
                ★ EXCLUSIVE
              </span>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="flex-1 p-5 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-[#d41c3d]">
                  Renditja #{banner.sort_order}
                </p>

                <h3 className="break-words text-xl font-extrabold text-gray-950">
                  {banner.title}
                </h3>

                {banner.link_url ? (
                  <a
                    href={banner.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block truncate text-sm font-semibold text-blue-600 hover:underline"
                  >
                    {banner.link_url}
                  </a>
                ) : (
                  <p className="mt-2 text-sm font-medium text-gray-400">
                    Pa link
                  </p>
                )}
              </div>

              <span
                className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-extrabold ${scheduleStatus.className}`}
              >
                {scheduleStatus.label}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Information
                label="Rotacioni"
                value={`${banner.duration_seconds} sekonda`}
              />

              <Information
                label="Desktop"
                value={`${banner.desktop_height}px`}
              />

              <Information
                label="Mobile"
                value={`${banner.mobile_height}px`}
              />

              <Information
                label="Modaliteti"
                value={
                  banner.is_exclusive
                    ? "Vetëm kjo reklamë"
                    : "Rotacion normal"
                }
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Information
                label="Data e fillimit"
                value={formatDate(banner.start_date)}
              />

              <Information
                label="Data e përfundimit"
                value={formatDate(banner.end_date)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => onToggleActive(banner)}
              disabled={busy}
              className={`rounded-xl px-4 py-2.5 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                banner.is_active
                  ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {banner.is_active
                ? "Çaktivizo reklamën"
                : "Aktivizo reklamën"}
            </button>

            <button
              type="button"
              onClick={() => onToggleExclusive(banner)}
              disabled={busy}
              className={`rounded-xl px-4 py-2.5 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                banner.is_exclusive
                  ? "bg-amber-400 text-amber-950 hover:bg-amber-500"
                  : "border border-amber-300 bg-white text-amber-700 hover:bg-amber-50"
              }`}
            >
              {banner.is_exclusive
                ? "Hiqe Exclusive"
                : "Bëje Exclusive"}
            </button>

            <button
              type="button"
              onClick={() => onEdit(banner)}
              disabled={busy}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-extrabold text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ndrysho
            </button>

            <button
              type="button"
              onClick={() => onDelete(banner)}
              disabled={busy}
              className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-extrabold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto"
            >
              Fshije
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Information({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-[11px] font-extrabold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-extrabold text-gray-800">
        {value}
      </p>
    </div>
  );
}