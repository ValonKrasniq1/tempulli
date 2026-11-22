"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Item = {
  name: string;
  icon: string;
  href?: string;
};

const platform: Item[] = [
  { name: "Ballina", icon: "home", href: "/" },
  { name: "Discover", icon: "compass", href: "/discover" },
  
  { name: "Të fundit", icon: "clock", href: "/#lajmet" },
  { name: "Video", icon: "video", href: "/#video" },
  { name: "Të ruajtura", icon: "bookmark" },
];

const marketplace: Item[] = [
  { name: "Shit-Bli", icon: "bag" },
  { name: "Publiko shpallje", icon: "plus" },
];

const categories: Item[] = [
  { name: "Lajme", icon: "news", href: "/category/lajme" },
  { name: "Lugina e Preshevës", icon: "pin", href: "/subcategory/lugina-e-presheves" },
  { name: "Kosovë", icon: "pin", href: "/subcategory/kosove" },
  { name: "Botë", icon: "globe", href: "/subcategory/bote" },
  { name: "Sport", icon: "trophy", href: "/category/sport" },
  { name: "Automjete", icon: "car", href: "/subcategory/automjete" },
  { name: "Ekonomi", icon: "chart", href: "/category/ekonomi" },
  { name: "Kulturë", icon: "book", href: "/category/kulture" },
  { name: "Magazina", icon: "star", href: "/category/magazina" },
  { name: "Fun", icon: "smile", href: "/category/fun" },
];

const media: Item[] = [
  { name: "Marketing", icon: "megaphone" },
  { name: "Raporto", icon: "camera" },
];

const paths: Record<string, string> = {
  home: "M3 10l9-7 9 7v11h-6v-7H9v7H3z",
  compass: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M16 8l-3 5-5 3 3-5z",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M12 6v6l4 2",
  video: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M10 8l6 4-6 4z",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  bag: "M4 7h16l1 14H3z M8 8V6a4 4 0 0 1 8 0v2",
  plus: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M7 12h10 M12 7v10",
  news: "M3 4h15v16H3z M18 8h3v12h-3 M6 8h9 M6 12h9 M6 16h6",
  pin: "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M2 12h20 M12 2c-6 6-6 14 0 20 M12 2c6 6 6 14 0 20",
  trophy: "M7 3h10v7a5 5 0 0 1-10 0z M7 5H3v3a4 4 0 0 0 4 4 M17 5h4v3a4 4 0 0 1-4 4 M12 15v5 M7 21h10",
  car: "M3 11l3-6h12l3 6v7H3z M3 11h18 M7 15h1 M16 15h1",
  chart: "M3 3v18h18 M6 15l5-5 4 3 6-7",
  book: "M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3z M12 6v15",
  star: "M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z",
  smile: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M8 14q4 5 8 0 M8 9h.1 M16 9h.1",
  cpu: "M6 6h12v12H6z M9 9h6v6H9z M9 2v4 M15 2v4 M9 18v4 M15 18v4 M2 9h4 M2 15h4 M18 9h4 M18 15h4",
  megaphone: "M3 9h5l12-5v16L8 15H3z M6 15l2 6h4l-2-5",
  camera: "M3 6h5l2-3h4l2 3h5v15H3z M12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}

function NavItem({ item }: { item: Item }) {
  const pathname = usePathname();
  const base =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold";

  const content = (
    <>
      <Icon name={item.icon} />
      <span>{item.name}</span>
    </>
  );

  return item.href ? (
    <Link
      href={item.href}
      className={`${base} ${
        item.href === pathname
          ? "bg-red-50 text-[#dc123c]"
          : "text-gray-700 hover:bg-gray-100 hover:text-[#dc123c]"
      }`}
    >
      {content}
    </Link>
  ) : (
    <button
      type="button"
      disabled
      title="Në zhvillim"
      className={`${base} cursor-not-allowed text-gray-400`}
    >
      {content}
    </button>
  );
}

function Group({
  title,
  items,
}: {
  title: string;
  items: Item[];
}) {
  return (
    <section className="mb-3 border-b border-gray-200 pb-3">
      <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-gray-500">
        {title}
      </p>

      <nav aria-label={title}>
        {items.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>
    </section>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside className="tempulli-left">

      <div className="flex items-center justify-between px-3 pb-3 pt-2">
        <span className="text-[11px] font-bold tracking-widest text-gray-500">
          NAVIGIMI
        </span>

        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Mbyll navigimin" : "Hap navigimin"}
          onClick={() => setOpen(!open)}
          className="rounded-md px-2 text-lg text-gray-600 hover:bg-gray-100"
        >
          {open ? "−" : "+"}
        </button>
      </div>

      {open && (
        <>
          <Group title="PLATFORMA" items={platform} />

          <Group title="MARKETPLACE" items={marketplace} />

          <Group title="KATEGORITË" items={categories} />

          <section>
            <p className="px-3 pb-2 text-[10px] font-bold tracking-widest text-gray-500">
              TEMPULLI MEDIA
            </p>

            <Link
              href="/subcategory/teknologji"
              className="mb-2 flex items-center gap-2 rounded-lg bg-[#11723d] px-3 py-3 text-xs font-bold text-white hover:bg-[#0d5c30]"
            >
              <Icon name="cpu" />
              TEMPULLI TECH
              <span className="ml-auto">↗</span>
            </Link>

            <nav aria-label="TEMPULLI MEDIA">
              {media.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>
          </section>

          <p className="mt-4 border-t border-gray-200 px-3 pt-4 text-[10px] text-gray-500">
            © 2026 TEMPULLI MEDIA
          </p>
        </>
      )}
    </aside>
  );
}


