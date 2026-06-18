"use client";

import { useEffect, useState } from "react";

const breakingNews = [
  "Kosova dhe Shqipëria nënshkruajnë marrëveshje të re bashkëpunimi",
  "BE miraton planin e ri për zgjerimin në Ballkanin Perëndimor",
  "Drita e Gjilanit shkon në finale të Kupës së Kosovës",
  "Ekspertët paralajmërojnë rritje të temperaturave gjatë javës",
];

export default function BreakingNews() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % breakingNews.length);
        setVisible(true);
      }, 400);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="border-b bg-gray-50">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <span className="shrink-0 rounded bg-[#d41c3d] px-3 py-1 text-xs font-bold text-white">
          BREAKING
        </span>

        <p
          className={`truncate text-sm font-semibold text-black transition-all duration-500 ${
            visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          {breakingNews[index]}
        </p>
      </div>
    </section>
  );
}