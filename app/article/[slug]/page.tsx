import TopBar from "../../../components/TopBar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticleSlugPage({ params }: Props) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

    console.log("SLUG:", slug);
console.log("POST:", post);

  return (
    <main className="min-h-screen bg-white">
      <TopBar />
      <Header />

      <section className="mx-auto max-w-4xl px-4 py-12">
        {!post ? (
          <h1 className="text-3xl font-bold text-black">Lajmi nuk u gjet.</h1>
        ) : (
          <>
            <p className="mb-4 text-sm font-bold text-[#d41c3d]">
              {post.category}
            </p>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-black">
              {post.title}
            </h1>

            {post.image_url ? (
              <img
                src={post.image_url}
                alt={post.title}
                className="mb-8 h-[450px] w-full rounded-lg object-cover"
              />
            ) : (
              <div className="mb-8 h-[450px] rounded-lg bg-gray-300"></div>
            )}

            <p className="whitespace-pre-line text-lg leading-8 text-gray-800">
              {post.content}
            </p>
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}