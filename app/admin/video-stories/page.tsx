"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

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
  id: number;
  is_enabled: boolean;
  title: string;
  show_count: number;
};

export default function VideoStoriesAdminPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [videos, setVideos] = useState<VideoStory[]>([]);

  const [isEnabled, setIsEnabled] = useState(true);
  const [sectionTitle, setSectionTitle] = useState("VIDEO STORIES");
  const [showCount, setShowCount] = useState(4);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("LAJME");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  function getYoutubeId(url: string) {
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&?/]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
  }

  function getThumbnail(url: string) {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
  }

  async function fetchSettings() {
    const { data } = await supabase
      .from("video_story_settings")
      .select("*")
      .limit(1)
      .single();

    if (data) {
      setSettings(data);
      setIsEnabled(data.is_enabled);
      setSectionTitle(data.title || "VIDEO STORIES");
      setShowCount(data.show_count || 4);
    }
  }

  async function fetchVideos() {
    const { data } = await supabase
      .from("video_stories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data) setVideos(data);
  }

  useEffect(() => {
    fetchSettings();
    fetchVideos();
  }, []);

  async function saveSettings() {
    setLoading(true);

    const payload = {
      is_enabled: isEnabled,
      title: sectionTitle,
      show_count: showCount,
      updated_at: new Date().toISOString(),
    };

    if (settings) {
      await supabase
        .from("video_story_settings")
        .update(payload)
        .eq("id", settings.id);
    } else {
      await supabase.from("video_story_settings").insert(payload);
    }

    setLoading(false);
    fetchSettings();
    alert("Settings u ruajtën.");
  }

  async function addVideo() {
    if (!title || !youtubeUrl) {
      alert("Shkruaj titullin dhe YouTube URL.");
      return;
    }

    setLoading(true);

    const nextOrder =
      videos.length > 0
        ? Math.max(...videos.map((video) => video.sort_order || 0)) + 1
        : 1;

    const { error } = await supabase.from("video_stories").insert({
      title,
      category,
      youtube_url: youtubeUrl,
      thumbnail_url: getThumbnail(youtubeUrl),
      duration,
      sort_order: nextOrder,
      is_active: isActive,
    });

    setLoading(false);

    if (error) {
      alert("Gabim: " + error.message);
      return;
    }

    setTitle("");
    setCategory("LAJME");
    setYoutubeUrl("");
    setDuration("");
    setIsActive(true);
    fetchVideos();
  }

  async function toggleVideo(video: VideoStory) {
    await supabase
      .from("video_stories")
      .update({ is_active: !video.is_active })
      .eq("id", video.id);

    fetchVideos();
  }

  async function deleteVideo(id: number) {
    if (!confirm("A je i sigurt që do ta fshish videon?")) return;

    await supabase.from("video_stories").delete().eq("id", id);
    fetchVideos();
  }

  return (
    <div className="space-y-6 text-black">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-3xl font-black">Video Stories</h1>
        <p className="mt-2 text-gray-500">
          Menaxho videot që shfaqen në Homepage.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block font-bold">Shfaq seksionin</label>
            <select
              value={isEnabled ? "on" : "off"}
              onChange={(e) => setIsEnabled(e.target.value === "on")}
              className="w-full rounded-xl border p-3"
            >
              <option value="on">ON</option>
              <option value="off">OFF</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-bold">Titulli i seksionit</label>
            <input
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block font-bold">Numri i videove</label>
            <select
              value={showCount}
              onChange={(e) => setShowCount(Number(e.target.value))}
              className="w-full rounded-xl border p-3"
            >
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={8}>8</option>
            </select>
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={loading}
          className="mt-6 rounded-xl bg-[#d41c3d] px-6 py-3 font-bold text-white"
        >
          Ruaj Settings
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-5 text-2xl font-black">Shto Video</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            placeholder="Titulli"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border p-3"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border p-3"
          >
            <option>LAJME</option>
            <option>KOSOVË</option>
            <option>BOTË</option>
            <option>SPORT</option>
            <option>TECH & AUTO</option>
            <option>MAGAZINA</option>
          </select>

          <input
            placeholder="YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="rounded-xl border p-3 md:col-span-2"
          />

          <input
            placeholder="Duration p.sh. 3:24"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="rounded-xl border p-3"
          />

          <label className="flex items-center gap-3 font-bold">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Aktive
          </label>
        </div>

        <button
          onClick={addVideo}
          disabled={loading}
          className="mt-6 rounded-xl bg-[#d41c3d] px-6 py-3 font-bold text-white"
        >
          Ruaj Videon
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-5 text-2xl font-black">Video Stories Aktive</h2>

        <div className="space-y-3">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="flex items-center justify-between gap-4 rounded-xl border p-4"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-black text-[#d41c3d]">
                  {index + 1}
                </span>

                {video.thumbnail_url && (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="h-16 w-24 rounded-lg object-cover"
                  />
                )}

                <div>
                  <h3 className="font-black">{video.title}</h3>
                  <p className="text-sm text-gray-500">
                    {video.category} • {video.duration || "pa kohë"} •{" "}
                    {video.is_active ? "Aktive" : "Jo aktive"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleVideo(video)}
                  className="rounded-lg bg-gray-100 px-4 py-2 font-bold"
                >
                  {video.is_active ? "Çaktivizo" : "Aktivizo"}
                </button>

                <button
                  onClick={() => deleteVideo(video.id)}
                  className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white"
                >
                  Fshi
                </button>
              </div>
            </div>
          ))}

          {videos.length === 0 && (
            <p className="text-gray-500">Ende nuk ka video.</p>
          )}
        </div>
      </div>
    </div>
  );
}