"use client";

import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function TrackPageView() {
  useEffect(() => {
    const saveView = async () => {
      await supabase.from("page_views").insert({
        path: window.location.pathname,
      });
    };

    saveView();
  }, []);

  return null;
}