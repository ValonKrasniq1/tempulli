"use client";

import { useEffect, useState } from "react";

const liveNews = [
  "Tempulli.info po ndërtohet si platformë moderne mediale",
  "Lajmet e fundit nga Lugina, Kosova dhe rajoni",
  "Së shpejti edhe seksioni i reklamave për bizneset",
  "Mirë se vini në portalin Tempulli.info",
];

export default function TopBar() {
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
    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setCurrentNews((prev) => (prev + 1) % liveNews.length);
        setVisible(true);
      }, 400);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-sm text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 md:flex-row md:items-center md:justify-between">
        <div className="text-gray-300">
          {today || "Duke u ngarkuar..."} | Prishtinë 27°C
        </div>

        <div className="flex items-center gap-3 overflow-hidden">
          <span className="shrink-0 rounded bg-[#d41c3d] px-2 py-1 text-xs font-bold">
            LIVE
          </span>

          <span
            className={`truncate font-medium transition-all duration-500 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
          >
            {liveNews[currentNews]}
          </span>
        </div>
      </div>
    </div>
  );
}