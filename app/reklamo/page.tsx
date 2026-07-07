export default function ReklamoPage() {
  const packages = [
    {
      name: "Top Banner",
      size: "970x120 / 1920x250",
      position: "Në krye të faqes",
      tag: "Premium",
    },
    {
      name: "Billboard Banner",
      size: "970x250",
      position: "Poshtë Breaking News",
      tag: "Më i dukshëm",
    },
    {
      name: "Inline Banner",
      size: "970x200",
      position: "Mes seksioneve të lajmeve",
      tag: "Klikime të mira",
    },
    {
      name: "Sidebar Banner",
      size: "300x250 / 300x600",
      position: "Kolona anësore në desktop",
      tag: "Biznese lokale",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-extrabold uppercase text-[#d41c3d]">
            Tempulli Advertising
          </p>

          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Reklamo biznesin tënd në Tempulli
          </h1>

          <p className="mt-5 text-lg text-gray-600">
            Arrit audiencë lokale dhe rajonale përmes bannerave, kampanjave dhe
            pozicioneve premium në portalin Tempulli.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="mailto:info@tempulli.info"
              className="rounded-xl bg-[#d41c3d] px-6 py-3 font-extrabold text-white"
            >
              Rezervo reklamë
            </a>

            <a
              href="/"
              className="rounded-xl border px-6 py-3 font-extrabold"
            >
              Shiko portalin
            </a>
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {packages.map((item) => (
            <div key={item.name} className="rounded-2xl border p-6 shadow-sm">
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#d41c3d]">
                {item.tag}
              </span>

              <h2 className="mt-5 text-2xl font-extrabold">{item.name}</h2>

              <p className="mt-3 text-sm font-bold text-gray-500">
                Madhësia: {item.size}
              </p>

              <p className="mt-2 text-sm text-gray-600">{item.position}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-gray-50 p-8">
          <h2 className="text-3xl font-extrabold">Pse të reklamoni te Tempulli?</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white p-5">
              <h3 className="font-extrabold">Audiencë lokale</h3>
              <p className="mt-2 text-sm text-gray-600">
                E përshtatshme për biznese në Kosovë, Luginë dhe diasporë.
              </p>
            </div>

            <div className="rounded-xl bg-white p-5">
              <h3 className="font-extrabold">Pozicione premium</h3>
              <p className="mt-2 text-sm text-gray-600">
                Bannerat shfaqen në pjesët më të dukshme të portalit.
              </p>
            </div>

            <div className="rounded-xl bg-white p-5">
              <h3 className="font-extrabold">Fleksibilitet</h3>
              <p className="mt-2 text-sm text-gray-600">
                Reklamat mund të aktivizohen, ndalen dhe ndryshohen shpejt.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}