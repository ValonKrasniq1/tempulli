import Link from "next/link";

export default function Hero() {
  const sideNews = [
    "BE miraton planin e ri për Ballkanin Perëndimor",
    "Drita e Gjilanit fiton dhe shkon në finale",
    "Si inteligjenca artificiale po ndryshon punën",
  ];

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Link href="/article">
          <div className="relative h-[420px] cursor-pointer overflow-hidden rounded bg-black transition hover:opacity-95">
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

            <div className="absolute bottom-0 p-8 text-white">
              <span className="mb-4 inline-block bg-[#d41c3d] px-3 py-1 text-xs font-bold">
                LAJMI KRYESOR
              </span>

              <h2 className="max-w-2xl text-4xl font-bold leading-tight">
                Kuvendi miraton masat e reja ekonomike, qeveria synon rritje
                prej 4.2% në 2025
              </h2>

              <p className="mt-4 max-w-xl text-sm text-gray-200">
                Qeveria ka prezantuar paketën e re ekonomike që synon
                përkrahjen e bizneseve dhe rritjen e investimeve.
              </p>

              <p className="mt-4 text-sm text-gray-300">
                8 Maj 2025 • 10:45
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="space-y-5">
        {sideNews.map((title) => (
          <Link href="/article" key={title}>
            <article className="cursor-pointer border-b pb-4 transition hover:opacity-70">
              <p className="mb-2 text-xs font-bold text-[#d41c3d]">
                LAJME
              </p>

              <h3 className="text-lg font-bold text-black">
                {title}
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                32 minuta më parë
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}