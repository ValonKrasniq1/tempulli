import Link from "next/link";

const categories = [
  { name: "LUGINA", href: "/lugina" },
  { name: "KOSOVË", href: "/kosove" },
  { name: "SPORT", href: "/sport" },
  { name: "TEKNOLOGJI", href: "/teknologji" },
  { name: "SHQIPËRI", href: "#" },
  { name: "BOTË", href: "#" },
  { name: "SHËNDETËSI", href: "#" },
  { name: "MAGAZINE", href: "#" },
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h2 className="mb-8 text-3xl font-bold text-black">
        KATEGORITË KRYESORE
      </h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => (
          <Link key={category.name} href={category.href}>
            <article className="flex h-32 cursor-pointer items-center justify-center rounded-lg bg-black text-white transition-all duration-300 hover:scale-105 hover:bg-[#d41c3d]">
              <h3 className="text-lg font-bold">
                {category.name}
              </h3>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}