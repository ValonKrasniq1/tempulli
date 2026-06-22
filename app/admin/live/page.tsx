"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type LiveMessage = {
  id: number;
  message: string;
  link_url: string | null;
  type: string;
  is_active: boolean;
  sort_order: number;
};

export default function LivePage() {
  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [type, setType] = useState("LIVE");
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchMessages() {
    const { data } = await supabase
      .from("live_messages")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data) setMessages(data);
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function addMessage() {
    if (!message.trim()) {
      alert("Shkruaje mesazhin LIVE.");
      return;
    }

    setLoading(true);

    await supabase.from("live_messages").insert({
      message,
      link_url: linkUrl || null,
      type,
      is_active: true,
      sort_order: messages.length + 1,
    });

    setMessage("");
    setLinkUrl("");
    setType("LIVE");
    setLoading(false);
    fetchMessages();
  }

  async function toggleActive(id: number, isActive: boolean) {
    await supabase
      .from("live_messages")
      .update({ is_active: !isActive })
      .eq("id", id);

    fetchMessages();
  }

  async function deleteMessage(id: number) {
    const ok = confirm("A je i sigurt që do ta fshish këtë LIVE mesazh?");
    if (!ok) return;

    await supabase.from("live_messages").delete().eq("id", id);
    fetchMessages();
  }

  return (
    <div className="space-y-6 text-black">
      <div className="rounded-xl bg-white p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold text-black">LIVE Messages</h1>

        <div className="space-y-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesazhi LIVE"
            className="w-full rounded border p-3 text-black placeholder:text-gray-400"
          />

          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Link opsional: Facebook, Instagram, website..."
            className="w-full rounded border p-3 text-black placeholder:text-gray-400"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded border p-3 text-black"
          >
            <option value="LIVE">LIVE</option>
            <option value="MARKETING">MARKETING</option>
            <option value="SPORT">SPORT</option>
            <option value="EVENT">EVENT</option>
            <option value="NJOFTIM">NJOFTIM</option>
          </select>

          <button
            onClick={addMessage}
            disabled={loading}
            className="rounded bg-[#d41c3d] px-6 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Duke shtuar..." : "Shto LIVE"}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-bold text-black">Mesazhet LIVE</h2>

        <div className="space-y-3">
          {messages.length === 0 ? (
            <p className="text-gray-500">Nuk ka ende mesazhe LIVE.</p>
          ) : (
            messages.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-bold text-black">
                    {item.type} | {item.message}
                  </p>

                  {item.link_url && (
                    <p className="text-sm text-blue-600">{item.link_url}</p>
                  )}

                  <p className="text-sm text-gray-500">
                    Statusi: {item.is_active ? "Aktiv" : "Jo aktiv"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(item.id, item.is_active)}
                    className="rounded bg-gray-200 px-4 py-2 font-bold text-black"
                  >
                    {item.is_active ? "Çaktivizo" : "Aktivizo"}
                  </button>

                  <button
                    onClick={() => deleteMessage(item.id)}
                    className="rounded bg-red-600 px-4 py-2 font-bold text-white"
                  >
                    Fshi
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}