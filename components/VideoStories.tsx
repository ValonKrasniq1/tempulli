"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type VideoStory = {
  id: number;
  title: string;
  category: string | null;
  youtube_url: string;
  thumbnail_url: string | null;
  duration: string | null;
  sort_order: number;
  is_active: boolean;
};

type Settings = {
  is_enabled: boolean;
  title: string;
  show_count: number;
};

function getYoutubeEmbedUrl(input: string) {
  if (input.includes("<iframe")) {
    const match = input.match(/src=["']([^"']+)["']/);
    return match ? match[1] : "";
  }

  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/;

  const match = input.match(regex);
  const id = match ? match[1] : "";

  return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : "";
}

export default function VideoStories() {
  const [videos, setVideos] = useState<VideoStory[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoStory | null>(null);

  useEffect(() => {
    async function fetchVideoStories() {
      const { data: settingsData } = await supabase
        .from("video_story_settings")
        .select("is_enabled, title, show_count")
        .limit(1)
        .single();

      if (!settingsData || settingsData.is_enabled === false) {
        setSettings(null);
        setVideos([]);
        return;
      }

      setSettings(settingsData);

      const { data: videosData } = await supabase
        .from("video_stories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(settingsData.show_count || 4);

      if (videosData) setVideos(videosData);
    }

    fetchVideoStories();
  }, []);

  if (!settings || videos.length === 0) return null;

  const embedUrl = selectedVideo
    ? getYoutubeEmbedUrl(selectedVideo.youtube_url)
    : "";

  return (
    <>
      <section className="border-y border-gray-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="border-l-4 border-[#d41c3d] pl-3 text-2xl font-extrabold text-black">
              {settings.title || "VIDEO STORIES"}
            </h2>

            <button className="text-sm font-extrabold text-[#d41c3d]">
              Shiko të gjitha →
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="w-[240px] shrink-0 rounded-xl bg-white p-2 text-left shadow-sm ring-1 ring-gray-200 transition hover:-translate-y-1 hover:shadow-md md:w-[260px]"
              >
                <div className="relative flex h-[130px] items-center justify-center overflow-hidden rounded-lg bg-gray-800">
                  {video.thumbnail_url && (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="h-full w-full object-cover opacity-80"
                    />
                  )}

                  <span className="absolute flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow">
                    ▶
                  </span>

                  {video.duration && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                      {video.duration}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs font-extrabold text-[#d41c3d]">
                  {video.category || "VIDEO"}
                </p>

                <h3 className="mt-1 line-clamp-2 text-base font-extrabold leading-snug text-black">
                  {video.title}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-black p-3">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl font-black text-black"
            >
              ×
            </button>

            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={selectedVideo.title}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-white">
                  Video linku nuk është valid.
                </div>
              )}
            </div>

            <h3 className="mt-4 text-xl font-extrabold text-white">
              {selectedVideo.title}
            </h3>
          </div>
        </div>
      )}
    </>
  );
}