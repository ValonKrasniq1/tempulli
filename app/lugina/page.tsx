import TopBar from "../../components/TopBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";

const news = [
  "Investime të reja në infrastrukturë në Luginë",
  "Nxënësit nga Bujanoci fitojnë çmime në garë rajonale",
  "Zhvillime të reja në Preshevë dhe Medvegjë",
  "Bizneset lokale kërkojnë mbështetje më të madhe",
  "Aktivitete kulturore gjatë fundjavës në Luginë",
  "Komuna njofton për projekte të reja publike",
];

export default function LuginaPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-8 border-b pb-4 text-5xl font-bold text-black">
          LUGINA
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {news.map((title) => (
            <Link
  href={`/article/${title.toLowerCase().replaceAll(" ", "-")}`}
  key={title}
>
              <article className="cursor-pointer transition hover:opacity-75">
                <div className="mb-4 h-48 rounded-lg bg-gray-300"></div>

                <p className="mb-2 text-xs font-bold text-[#d41c3d]">
                  LUGINA
                </p>

                <h2 className="text-xl font-bold text-black">{title}</h2>

                <p className="mt-3 text-sm text-gray-500">
                  32 minuta më parë
                </p>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}