import { MetadataRoute } from "next";
import { supabase } from "../lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.tempulli.info";

  const { data: posts } = await supabase
    .from("posts")
    .select("slug, created_at")
    .eq("status", "published");

  const articleUrls =
    posts?.map((post) => ({
      url: `${baseUrl}/article/${post.slug}`,
      lastModified: post.created_at,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    })) || [];

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },
    ...articleUrls,
  ];
}