import type { Metadata } from "next";
import TopBar from "../../../components/TopBar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { supabase } from "../../../lib/supabase";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

function createDescription(post: any) {
  const text = post.lead || post.content || "Lexo lajmin e plotë në Tempulli.";
  return text.replace(/\s+/g, " ").slice(0, 160);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) {
    return {
      title: "Lajmi nuk u gjet | Tempulli",
      description: "Lajmi nuk u gjet në portalin Tempulli.",
    };
  }

  const description = createDescription(post);
  const image = post.image_url || "https://www.tempulli.info/favicon.ico";
  const url = `https://www.tempulli.info/article/${post.slug}`;

  return {
    title: `${post.title} | Tempulli`,
    description,
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: "Tempulli",
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [image],
    },
  };
}

export default async function ArticleSlugPage({ params }: Props) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

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
              {post.subcategory ? ` • ${post.subcategory}` : ""}
            </p>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-black md:text-5xl">
              {post.title}
            </h1>

            {post.image_url ? (
              <img
                src={post.image_url}
                alt={post.title}
                className="mb-8 h-[260px] w-full rounded-lg object-cover md:h-[450px]"
              />
            ) : (
              <div className="mb-8 h-[260px] rounded-lg bg-gray-300 md:h-[450px]" />
            )}

            {post.lead && (
              <p className="mb-8 text-xl font-bold leading-8 text-black md:text-2xl md:leading-9">
                {post.lead}
              </p>
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