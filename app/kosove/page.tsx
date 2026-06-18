import TopBar from "../../components/TopBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";

const news = [
  "Qeveria miraton strategjinë për digjitalizimin e shërbimeve",
  "Kuvendi diskuton për zhvillimet e fundit politike",
  "Komunat kërkojnë më shumë mbështetje financiare",
  "Rritet interesimi për investime në Kosovë",
  "Institucionet paralajmërojnë masa të reja ekonomike",
  "Raporti i ri vlerëson progresin në reforma",
];

export default function KosovePage() {
  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-8 border-b pb-4 text-5xl font-bold text-black">
          KOSOVË
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {news.map((title) => (
            <Link href="/article" key={title}>
              <article className="cursor-pointer transition hover:opacity-75">
                <div className="mb-4 h-48 rounded-lg bg-gray-300"></div>
                <p className="mb-2 text-xs font-bold text-[#d41c3d]">
                  KOSOVË
                </p>
                <h2 className="text-xl font-bold text-black">{title}</h2>
                <p className="mt-3 text-sm text-gray-500">32 minuta më parë</p>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}