import TopBar from "../../components/TopBar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";

const news = [
  "Drita e Gjilanit fiton dhe shkon në finale",
  "Java e 32-të në Superligë, rezultatet dhe renditja",
  "Përfaqësuesja përgatitet për ndeshjet e radhës",
  "Klubet kosovare kërkojnë përforcime të reja",
  "Talenti i ri nga Lugina shkëlqen në kampionat",
  "Trajneri paralajmëron ndryshime në formacion",
];

export default function SportPage() {
  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-8 border-b pb-4 text-5xl font-bold text-black">
          SPORT
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {news.map((title) => (
            <Link href="/article" key={title}>
              <article className="cursor-pointer transition hover:opacity-75">
                <div className="mb-4 h-48 rounded-lg bg-gray-300"></div>
                <p className="mb-2 text-xs font-bold text-[#d41c3d]">
                  SPORT
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