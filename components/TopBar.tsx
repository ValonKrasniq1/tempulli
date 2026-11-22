"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { usePreferences } from "./PreferencesProvider";

type LiveMessage = {
  id: number;
  message: string;
  link_url?: string | null;
  type?: string | null;
  duration_seconds?: number | null;
};

type City = {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type Weather = {
  temperature: number;
  code: number;
};

const CITIES: City[] = [
  { name: "Prishtinë", latitude: 42.6629, longitude: 21.1655, timezone: "Europe/Belgrade" },
  { name: "Prizren", latitude: 42.2139, longitude: 20.7397, timezone: "Europe/Belgrade" },
  { name: "Gjilan", latitude: 42.4635, longitude: 21.4694, timezone: "Europe/Belgrade" },
  { name: "Ferizaj", latitude: 42.3702, longitude: 21.1483, timezone: "Europe/Belgrade" },
  { name: "Pejë", latitude: 42.6591, longitude: 20.2883, timezone: "Europe/Belgrade" },
  { name: "Gjakovë", latitude: 42.3803, longitude: 20.4308, timezone: "Europe/Belgrade" },
  { name: "Mitrovicë", latitude: 42.8914, longitude: 20.8660, timezone: "Europe/Belgrade" },
  { name: "Podujevë", latitude: 42.9106, longitude: 21.1939, timezone: "Europe/Belgrade" },
  { name: "Bujanoc", latitude: 42.4592, longitude: 21.7667, timezone: "Europe/Belgrade" },
  { name: "Preshevë", latitude: 42.3064, longitude: 21.6503, timezone: "Europe/Belgrade" },
  { name: "Shkup", latitude: 41.9981, longitude: 21.4254, timezone: "Europe/Skopje" },
  { name: "Tetovë", latitude: 42.0097, longitude: 20.9716, timezone: "Europe/Skopje" },
  { name: "Tiranë", latitude: 41.3275, longitude: 19.8187, timezone: "Europe/Tirane" },
  { name: "Durrës", latitude: 41.3231, longitude: 19.4414, timezone: "Europe/Tirane" },
];

function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const paths: Record<string, React.ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    chevron: <path d="m6 9 6 6 6-6" />,
    target: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 shrink-0 ${className}`}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function weatherSymbol(code: number) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code === 85 || code === 86) return "🌨️";
  if (code >= 95) return "⛈️";
  return "☁️";
}

function safeLink(value?: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value, window.location.origin);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

function distance(
  latitude: number,
  longitude: number,
  city: City
) {
  const rad = Math.PI / 180;
  const dLat = (city.latitude - latitude) * rad;
  const dLon = (city.longitude - longitude) * rad;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latitude * rad) *
      Math.cos(city.latitude * rad) *
      Math.sin(dLon / 2) ** 2;

  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

export default function TopBar() {
  const { language } = usePreferences();
  const isAlbanian = language === "sq";

  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [currentNews, setCurrentNews] = useState(0);
  const [visible, setVisible] = useState(true);

  const [now, setNow] = useState<Date | null>(null);
  const [city, setCity] = useState<City>(CITIES[0]);
  const [weather, setWeather] = useState<Weather | null>(null);

  const [locationOpen, setLocationOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  /* DATE AND TIME */

  useEffect(() => {
    setNow(new Date());

    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  /* SAVED CITY */

  useEffect(() => {
    try {
      const savedCity = localStorage.getItem("tempulli-city");

      const found = CITIES.find(
        (item) => item.name === savedCity
      );

      if (found) setCity(found);
    } catch {
      // Use Prishtina as the default city.
    }
  }, []);

  function selectCity(newCity: City) {
    setCity(newCity);
    setWeather(null);
    setLocationOpen(false);
    setLocationError("");

    try {
      localStorage.setItem("tempulli-city", newCity.name);
    } catch {
      // City selection still works for this visit.
    }
  }

  /* OPTIONAL GEOLOCATION */

  function detectLocation() {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        isAlbanian
          ? "Lokacioni nuk mbështetet."
          : "Location is not supported."
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const nearest = [...CITIES].sort(
          (a, b) =>
            distance(latitude, longitude, a) -
            distance(latitude, longitude, b)
        )[0];

        setLocating(false);

        if (distance(latitude, longitude, nearest) > 50) {
          setLocationError(
            isAlbanian
              ? "Nuk u gjet qytet i afërt në listë."
              : "No nearby supported city was found."
          );
          return;
        }

        selectCity(nearest);
      },
      () => {
        setLocating(false);
        setLocationError(
          isAlbanian
            ? "Zgjidhe qytetin manualisht."
            : "Please select your city manually."
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  /* WEATHER */

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setWeather(null);

    async function fetchWeather() {
      const endpoint =
        process.env.NEXT_PUBLIC_WEATHER_API_URL;

      if (!endpoint) return;

      try {
        const url = new URL(endpoint, window.location.origin);

        url.searchParams.set(
          "latitude",
          String(city.latitude)
        );

        url.searchParams.set(
          "longitude",
          String(city.longitude)
        );

        url.searchParams.set(
          "current",
          "temperature_2m,weather_code"
        );

        url.searchParams.set(
          "timezone",
          city.timezone
        );

        url.searchParams.set(
          "temperature_unit",
          "celsius"
        );

        const response = await fetch(url.toString(), {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (!cancelled) setWeather(null);
          return;
        }

        const data = await response.json();

        if (
          !cancelled &&
          typeof data.current?.temperature_2m === "number" &&
          typeof data.current?.weather_code === "number"
        ) {
          setWeather({
            temperature: Math.round(
              data.current.temperature_2m
            ),
            code: data.current.weather_code,
          });
        } else if (!cancelled) {
          setWeather(null);
        }
      } catch {
        if (!cancelled) setWeather(null);
      }
    }

    void fetchWeather();

    const timer = window.setInterval(
      fetchWeather,
      15 * 60 * 1000
    );

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(timer);
    };
  }, [city]);

  /* LIVE MESSAGES FROM DASHBOARD */

  useEffect(() => {
    let cancelled = false;

    async function fetchLiveMessages() {
      const { data, error } = await supabase
        .from("live_messages")
        .select(
          "id, message, link_url, type, duration_seconds"
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!cancelled && !error && data) {
        setMessages(data as LiveMessage[]);
        setCurrentNews(0);
        setVisible(true);
      }
    }

    void fetchLiveMessages();

    const timer = window.setInterval(
      fetchLiveMessages,
      60 * 1000
    );

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  /* MESSAGE ROTATION */

  useEffect(() => {
    if (messages.length <= 1) return;

    const seconds = Math.max(
      3,
      messages[currentNews]?.duration_seconds || 10
    );

    let transitionTimer: number | undefined;

    const timer = window.setTimeout(() => {
      setVisible(false);

      transitionTimer = window.setTimeout(() => {
        setCurrentNews(
          (previous) => (previous + 1) % messages.length
        );

        setVisible(true);
      }, 300);
    }, seconds * 1000);

    return () => {
      window.clearTimeout(timer);

      if (transitionTimer !== undefined) {
        window.clearTimeout(transitionTimer);
      }
    };
  }, [messages, currentNews]);

  /* DATE FORMAT */

  const today = now
    ? new Intl.DateTimeFormat(
        isAlbanian ? "sq-AL" : "en-GB",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: city.timezone,
        }
      ).format(now)
    : "—";

  const mobileDate = now
    ? new Intl.DateTimeFormat(
        isAlbanian ? "sq-AL" : "en-GB",
        {
          day: "numeric",
          month: "short",
          timeZone: city.timezone,
        }
      ).format(now)
    : "—";

  const time = now
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: city.timezone,
      }).format(now)
    : "--:--";

  const currentMessage = messages[currentNews];
  const messageLink = currentMessage
    ? safeLink(currentMessage.link_url)
    : null;

  return (
    <div className="relative z-[60] bg-black text-white">
      <div className="tempulli-container">

        <div className="flex min-h-[36px] flex-col
          gap-2 py-2 lg:flex-row lg:items-center
          lg:justify-between">

          {/* DATE, TIME, LOCATION AND WEATHER */}

          <div className="flex flex-wrap items-center
            gap-x-3 gap-y-2 text-[11px] text-white/80
            sm:text-xs">

            {/* DATE */}

            <div className="flex items-center gap-1.5">
              <Icon
                name="calendar"
                className="hidden text-white/50 sm:block"
              />

              <span className="hidden capitalize sm:inline">
                {today}
              </span>

              <span className="capitalize sm:hidden">
                {mobileDate}
              </span>
            </div>

            <span className="text-white/20">|</span>

            {/* TIME */}

            <div className="flex items-center gap-1.5">
              <Icon name="clock" className="text-white/50" />

              <span className="font-semibold tabular-nums">
                {time}
              </span>
            </div>

            <span className="text-white/20">|</span>

            {/* LOCATION */}

            <div className="relative">
              <button
                type="button"
                onClick={() => setLocationOpen(!locationOpen)}
                aria-expanded={locationOpen}
                className="flex items-center gap-1
                  transition hover:text-white"
              >
                <Icon
                  name="location"
                  className="text-white/60"
                />

                <span>{city.name}</span>

                <Icon
                  name="chevron"
                  className="h-3 w-3 text-white/40"
                />
              </button>

              {locationOpen && (
                <div className="absolute right-0 top-full
                  z-[100] mt-3 w-[220px] overflow-hidden
                  rounded-xl border border-white/10
                  bg-[#171717] shadow-2xl sm:left-0 sm:right-auto">

                  <div className="border-b border-white/10 p-3">
                    <div className="mb-2 text-[11px]
                      font-bold uppercase tracking-wider
                      text-white/50">

                      {isAlbanian
                        ? "ZGJIDH QYTETIN"
                        : "SELECT CITY"}
                    </div>

                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={locating}
                      className="flex w-full items-center
                        gap-2 rounded-lg bg-[#d41c3d]
                        px-3 py-2.5 text-left text-xs
                        font-bold text-white
                        disabled:opacity-50"
                    >
                      <Icon name="target" />

                      {locating
                        ? isAlbanian
                          ? "Duke kërkuar..."
                          : "Locating..."
                        : isAlbanian
                          ? "Gjej qytetin më të afërt"
                          : "Find nearest city"}
                    </button>

                    {locationError && (
                      <p className="mt-2 text-xs text-red-300">
                        {locationError}
                      </p>
                    )}
                  </div>

                  <div className="max-h-[280px]
                    overflow-y-auto p-1">

                    {CITIES.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => selectCity(item)}
                        className={`flex w-full items-center
                          justify-between rounded-md px-3
                          py-2.5 text-left text-xs transition
                          ${
                            item.name === city.name
                              ? "bg-white/10 font-bold text-white"
                              : "text-white/70 hover:bg-white/5"
                          }`}
                      >
                        {item.name}

                        {item.name === city.name && (
                          <span className="text-[#d41c3d]">
                            ●
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* WEATHER */}

            {weather && (
              <>
                <span className="text-white/20">|</span>

                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">
                    {weatherSymbol(weather.code)}
                  </span>

                  <span className="font-bold text-white">
                    {weather.temperature}°C
                  </span>
                </div>
              </>
            )}

          </div>

          {/* LIVE / MARKETING MESSAGE */}

          {currentMessage ? (
            <div className="flex min-w-0 items-center
              gap-2 overflow-hidden border-t
              border-white/10 pt-2 lg:max-w-[55%]
              lg:border-0 lg:pt-0">

              <span className="flex shrink-0 items-center
                gap-1.5 rounded bg-[#d41c3d]
                px-2 py-1 text-[10px] font-extrabold
                uppercase tracking-wide text-white">

                {(currentMessage.type || "LIVE")
                  .toUpperCase() === "LIVE" && (
                    <span className="h-1.5 w-1.5
                      animate-pulse rounded-full bg-white" />
                )}

                {currentMessage.type || "LIVE"}
              </span>

              {messageLink ? (
                <a
                  href={messageLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`min-w-0 truncate text-xs
                    font-medium text-white transition-all
                    duration-300 hover:text-[#d41c3d]
                    ${
                      visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-1 opacity-0"
                    }`}
                >
                  {currentMessage.message}
                </a>
              ) : (
                <span
                  className={`min-w-0 truncate text-xs
                    font-medium text-white transition-all
                    duration-300
                    ${
                      visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-1 opacity-0"
                    }`}
                >
                  {currentMessage.message}
                </span>
              )}

            </div>
          ) : (
            <span className="hidden text-[10px]
              font-bold uppercase tracking-[0.2em]
              text-white/40 lg:block">

              TEMPULLI.INFO

            </span>
          )}

        </div>
      </div>
    </div>
  );
}