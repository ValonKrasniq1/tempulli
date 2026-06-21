import Link from "next/link";
import TopBar from "../../../components/TopBar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";

type Props = {
  params: Promise<{ slug: string }>;
};

const subcategoryMap: Record<string, string> = {
  "lugina-e-presheves": "Lugina e Preshevës",
  kosove: "Kosovë",
  shqiperi: "Shqipëri",
  diaspore: "Diasporë",
  rajon: "Rajon",
  evrope: "Evropë",
  bote: "Botë",
  futboll: "Futboll",
  basketboll: "Basketboll",
  "formula-1": "Formula 1",
  "sporte-te-tjera": "Sporte të tjera",
  teknologji: "Teknologji",
  automjete: "Automjete",
  telefona: "Telefona",
  lojera: "Lojëra",
  kuriozitete: "Kuriozitete",
  fakte: "Fakte",
  "te-tjera": "Të tjera",
  film: "Film",
  muzike: "Muzikë",
  histori: "Histori",
  libra: "Libra",
  fotografi: "Fotografi",
  financa: "Financa",
  biznes: "Biznes",
  shendeti: "Shëndeti",
  jete: "Jetë",
  lifestyle: "Lifestyle",
  "kuriozitete-magazina": "Kuriozitete",
};

export default async function SubcategoryPage({ params }: Props) {
  const { slug } = await params;
  const subcategory = subcategoryMap[slug] || slug;

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq("subcategory", subcategory)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="mb-8 border-b pb-4 text-4xl font-bold text-black">
          {subcategory}
        </h1>

        {!posts || posts.length === 0 ? (
          <p className="text-gray-500">Nuk ka lajme në këtë nënkategori.</p>
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
                    {post.category}
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