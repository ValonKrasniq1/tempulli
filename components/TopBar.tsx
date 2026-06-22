"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type LiveMessage = {
  id: number;
  message: string;
  link_url?: string | null;
  type?: string | null;
};

export default function TopBar() {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [currentNews, setCurrentNews] = useState(0);
  const [visible, setVisible] = useState(true);
  const [today, setToday] = useState("");

  useEffect(() => {
    const formattedDate = new Date().toLocaleDateString("sq-AL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    setToday(formattedDate);
  }, []);

  useEffect(() => {
    async function fetchLiveMessages() {
      const { data, error } = await supabase
        .from("live_messages")
        .select("id, message, link_url, type")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && data) {
        setMessages(data as LiveMessage[]);
      }
    }

    fetchLiveMessages();
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setCurrentNews((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, 10000);

    return () => clearInterval(interval);
  }, [messages.length]);

  if (messages.length === 0) {
    return null;
  }

  const currentMessage = messages[currentNews];

  return (
    <div className="bg-black text-sm text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between">
        <div className="text-gray-300">
          {today || "Duke u ngarkuar..."} | Prishtinë
        </div>

        <div className="flex min-w-0 items-center gap-3 overflow-hidden">
          <span className="shrink-0 rounded bg-[#d41c3d] px-2 py-1 text-xs font-bold">
            {currentMessage.type || "LIVE"}
          </span>

          {currentMessage.link_url ? (
            <a
              href={currentMessage.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`truncate font-medium transition-all duration-500 hover:text-[#d41c3d] ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1 opacity-0"
              }`}
            >
              {currentMessage.message}
            </a>
          ) : (
            <span
              className={`truncate font-medium transition-all duration-500 ${
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1 opacity-0"
              }`}
            >
              {currentMessage.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}