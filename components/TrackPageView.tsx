"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function TrackPageView() {
  useEffect(() => {
    async function saveView() {
      let visitorId = localStorage.getItem("visitor_id");

      if (!visitorId) {
        visitorId =
          crypto.randomUUID?.() ||
          Math.random().toString(36).substring(2) + Date.now();

        localStorage.setItem("visitor_id", visitorId);
      }

      await supabase.from("page_views").insert({
        path: window.location.pathname,
        visitor_id: visitorId,
      });
    }

    saveView();
  }, []);

  return null;
}