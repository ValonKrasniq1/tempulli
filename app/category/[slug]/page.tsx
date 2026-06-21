import Link from "next/link";
import TopBar from "../../../components/TopBar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";

type Props = {
  params: Promise<{ slug: string }>;
};

const categoryMap: Record<string, string> = {
  lajme: "LAJME",
  sport: "SPORT",
  "tech-auto": "TECH & AUTO",
  fun: "FUN",
  kulture: "KULTURË",
  ekonomi: "EKONOMI",
  magazina: "MAGAZINA",
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = categoryMap[slug] || slug.toUpperCase();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq("category", category)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="mb-8 border-b pb-4 text-4xl font-bold text-black">
          {category}
        </h1>

        {!posts || posts.length === 0 ? (
          <p className="text-gray-500">Nuk ka lajme në këtë kategori.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <Link href={`/article/${post.slug}`} key={post.id}>
                <article className="cursor-pointer transition hover:opacity-75">
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="mb-4 h-40 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mb-4 h-40 rounded-lg bg-gray-300" />
                  )}

                  <p className="mb-2 text-xs font-bold text-[#d41c3d]">
                    {post.subcategory || post.category}
                  </p>

                  <h2 className="font-bold leading-snug text-black">
                    {post.title}
                  </h2>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}