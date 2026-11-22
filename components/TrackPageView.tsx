
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

const HEARTBEAT_INTERVAL = 30_000;

const EXCLUDED_PATHS =
  /^\/(admin|login|register|account|api|forgot-password|reset-password)(\/|$)/;

const TECH_PATHS =
  /^\/subcategory\/(teknologji|telefona|lojera)(\/|$)/;

function getVisitorId() {
  let id = localStorage.getItem("visitor_id");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("visitor_id", id);
  }

  return id;
}

function getDeviceType() {
  const ua = navigator.userAgent;

  if (
    /iPad|Tablet|PlayBook/i.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
    (
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1
    )
  ) {
    return "tablet";
  }

  if (/Mobile|Android|iPhone|iPod/i.test(ua)) {
    return "mobile";
  }

  return "desktop";
}

function getBrowser() {
  const ua = navigator.userAgent;

  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/TikTok|Bytedance/i.test(ua)) return "TikTok";
  if (/Edg|EdgiOS|EdgA/i.test(ua)) return "Edge";
  if (/OPR|Opera/i.test(ua)) return "Opera";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Firefox|FxiOS/i.test(ua)) return "Firefox";
  if (/Chrome|CriOS/i.test(ua)) return "Chrome";
  if (/Safari/i.test(ua)) return "Safari";

  return "Other";
}

function getOperatingSystem() {
  const ua = navigator.userAgent;

  if (/Windows Phone/i.test(ua)) return "Windows Phone";
  if (/Android/i.test(ua)) return "Android";

  if (
    /iPhone|iPad|iPod/i.test(ua) ||
    (
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1
    )
  ) {
    return "iOS / iPadOS";
  }

  if (/Windows/i.test(ua)) return "Windows";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  if (/Macintosh|Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";

  return "Other";
}

function getTrafficData() {
  const params = new URLSearchParams(
    window.location.search
  );

  const utmSource = params.get("utm_source")?.slice(0, 150) || null;
  const utmMedium = params.get("utm_medium")?.slice(0, 150) || null;
  const utmCampaign = params.get("utm_campaign")?.slice(0, 150) || null;

  let referrer: string | null = null;
  let domain = "";

  try {
    if (document.referrer) {
      const url = new URL(document.referrer);

      referrer = url.origin;
      domain = url.hostname.toLowerCase();
    }
  } catch {}

  let trafficSource = "Direct";

  if (utmSource) {
    trafficSource = utmSource.toLowerCase();
  } else if (params.has("fbclid")) {
    trafficSource = "Meta";
  } else if (params.has("gclid")) {
    trafficSource = "Google Ads";
  } else if (params.has("ttclid")) {
    trafficSource = "TikTok";
  } else if (/facebook\.com|fb\.com/.test(domain)) {
    trafficSource = "Facebook";
  } else if (/instagram\.com/.test(domain)) {
    trafficSource = "Instagram";
  } else if (/tiktok\.com/.test(domain)) {
    trafficSource = "TikTok";
  } else if (/google\./.test(domain)) {
    trafficSource = "Google";
  } else if (/bing\.com/.test(domain)) {
    trafficSource = "Bing";
  } else if (/youtube\.com|youtu\.be/.test(domain)) {
    trafficSource = "YouTube";
  } else if (/linkedin\.com/.test(domain)) {
    trafficSource = "LinkedIn";
  } else if (/twitter\.com|^x\.com$|^t\.co$/.test(domain)) {
    trafficSource = "X";
  } else if (/whatsapp\.com/.test(domain)) {
    trafficSource = "WhatsApp";
  } else if (
    domain === "tempulli.info" ||
    domain === "www.tempulli.info"
  ) {
    trafficSource = "Internal";
  } else if (domain) {
    trafficSource = domain;
  }

  return {
    referrer,
    traffic_source: trafficSource,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
  };
}

function isExcludedHost() {
  return ![
    "tempulli.info",
    "www.tempulli.info",
  ].includes(window.location.hostname);
}

export default function TrackPageView() {
  const pathname = usePathname();

  const sessionId = useRef<string | null>(null);
  const lastTrackedPath = useRef<string | null>(null);

  const trafficData = useRef<
    ReturnType<typeof getTrafficData> | null
  >(null);

  useEffect(() => {
    if (!pathname) return;

    if (
      isExcludedHost() ||
      EXCLUDED_PATHS.test(pathname)
    ) {
      lastTrackedPath.current = null;
      return;
    }

    let visitorId: string;

    try {
      visitorId = getVisitorId();

      if (!sessionId.current) {
        sessionId.current = crypto.randomUUID();
      }

      if (!trafficData.current) {
        trafficData.current = getTrafficData();
      }
    } catch {
      return;
    }

    const currentSession = sessionId.current;
    const currentTraffic = trafficData.current;

    let cancelled = false;
    let heartbeatRunning = false;
    let initialized = false;

    const deviceType = getDeviceType();
    const browser = getBrowser();
    const operatingSystem = getOperatingSystem();

    let pageTitle =
      pathname === "/" ? "Ballina" : pathname;

    let platform: "info" | "tech" =
      TECH_PATHS.test(pathname) ? "tech" : "info";

    function normalize(value: string) {
      return value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    }

    async function resolvePage() {
      const articleSlug = pathname.startsWith("/article/")
        ? pathname.split("/")[2]
        : null;

      if (articleSlug) {
        const { data } = await supabase
          .from("posts")
          .select("title,category,subcategory")
          .eq("slug", articleSlug)
          .eq("status", "published")
          .maybeSingle();

        if (data) {
          pageTitle = data.title;

          const category = normalize(
            data.category || ""
          );

          const subcategory = normalize(
            data.subcategory || ""
          );

          if (
            ["teknologji", "telefona", "lojera"]
              .includes(subcategory) ||
            category === "teknologji"
          ) {
            platform = "tech";
          }
        }
      } else if (pathname === "/discover") {
        pageTitle = "Discover";
      } else if (platform === "tech") {
        pageTitle = "TEMPULLI TECH";
      } else if (pathname !== "/") {
        try {
          pageTitle = decodeURIComponent(
            pathname
              .split("/")
              .filter(Boolean)
              .pop() || pathname
          ).replace(/-/g, " ");
        } catch {
          pageTitle = pathname;
        }
      }
    }

    async function savePageView() {
      if (
        cancelled ||
        !initialized ||
        document.visibilityState !== "visible" ||
        lastTrackedPath.current === pathname
      ) {
        return;
      }

      lastTrackedPath.current = pathname;

      try {
        const { error } = await supabase
          .from("page_views")
          .insert({
            path: pathname,
            visitor_id: visitorId,
            session_id: currentSession,
            page_title: pageTitle,
            platform,
            device_type: deviceType,
            browser,
            operating_system: operatingSystem,
            referrer: currentTraffic?.referrer ?? null,
            traffic_source:
              currentTraffic?.traffic_source ?? "Unknown",
            utm_source: currentTraffic?.utm_source ?? null,
            utm_medium: currentTraffic?.utm_medium ?? null,
            utm_campaign: currentTraffic?.utm_campaign ?? null,
          });

        if (error) {
          console.error(
            "Page view error:",
            error.message
          );

          if (
            !cancelled &&
            lastTrackedPath.current === pathname
          ) {
            lastTrackedPath.current = null;
          }
        }
      } catch (error) {
        console.error("Tracking error:", error);

        if (
          !cancelled &&
          lastTrackedPath.current === pathname
        ) {
          lastTrackedPath.current = null;
        }
      }
    }

    async function sendHeartbeat() {
      if (
        cancelled ||
        !initialized ||
        heartbeatRunning ||
        document.visibilityState !== "visible" ||
        !currentSession
      ) {
        return;
      }

      heartbeatRunning = true;

      try {
        const { error } = await supabase.rpc(
          "track_live_visitor",
          {
            p_session_id: currentSession,
            p_visitor_id: visitorId,
            p_path: pathname,
            p_page_title: pageTitle,
            p_platform: platform,
            p_device_type: deviceType,
          }
        );

        if (error) {
          console.error(
            "Heartbeat error:",
            error.message
          );
        }
      } catch (error) {
        console.error(
          "Live tracking error:",
          error
        );
      } finally {
        heartbeatRunning = false;
      }
    }

    async function initializeTracking() {
      try {
        await resolvePage();
      } catch (error) {
        console.error(
          "Page information error:",
          error
        );
      }

      if (cancelled) return;

      initialized = true;

      await Promise.all([
        savePageView(),
        sendHeartbeat(),
      ]);
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void savePageView();
        void sendHeartbeat();
      }
    }

    void initializeTracking();

    const interval = window.setInterval(() => {
      void sendHeartbeat();
    }, HEARTBEAT_INTERVAL);

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      cancelled = true;

      window.clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [pathname]);

  return null;
}
