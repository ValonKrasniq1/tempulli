
"use client";

import { usePreferences } from "./PreferencesProvider";

export default function PreferencesControls({
  brand = "info",
}: {
  brand?: "info" | "tech";
}) {
  const {
    theme,
    language,
    toggleTheme,
    setLanguage,
    t,
  } = usePreferences();

  const dark = theme === "dark";

  const accent =
    brand === "tech" ? "#288B5F" : "#D41C3D";

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">

      {/* LANGUAGE SWITCH */}

      <div
        className={`flex items-center rounded-full border p-1 ${
          dark
            ? "border-[#303438] bg-[#1b1e20]"
            : "border-gray-200 bg-gray-100"
        }`}
      >
        {(["sq", "en"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={language === value}
            onClick={() => setLanguage(value)}
            style={{
              backgroundColor:
                language === value
                  ? accent
                  : "transparent",
            }}
            className={`rounded-full px-3 py-2 text-xs font-bold uppercase transition sm:px-4 ${
              language === value
                ? "text-white"
                : dark
                  ? "text-gray-400"
                  : "text-gray-500"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {/* DARK / LIGHT SWITCH */}

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={
          dark
            ? t("Pamja e bardhë", "Light mode")
            : t("Pamja e errët", "Dark mode")
        }
        title={
          dark
            ? t("Pamja e bardhë", "Light mode")
            : t("Pamja e errët", "Dark mode")
        }
        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition sm:h-11 sm:w-11 ${
          dark
            ? "border-[#303438] bg-[#191b1d] text-white hover:bg-[#292c2f]"
            : "border-gray-200 bg-white text-[#151515] hover:bg-gray-100"
        }`}
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {dark ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2" />
              <path d="M2 12h2M20 12h2" />
              <path d="m4.9 4.9 1.4 1.4" />
              <path d="m17.7 17.7 1.4 1.4" />
              <path d="m4.9 19.1 1.4-1.4" />
              <path d="m17.7 6.3 1.4-1.4" />
            </>
          ) : (
            <path d="M20.9 13.3A9 9 0 0 1 10.7 3.1 9 9 0 1 0 20.9 13.3Z" />
          )}
        </svg>
      </button>

    </div>
  );
}
