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
  duration_seconds: number;
};

export default function LivePage() {
  const [editingId, setEditingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [type, setType] = useState("LIVE");
  const [durationSeconds, setDurationSeconds] = useState(10);

  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchMessages() {
    const { data } = await supabase
      .from("live_messages")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (data) setMessages(data as LiveMessage[]);
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  function resetForm() {
    setEditingId(null);
    setMessage("");
    setLinkUrl("");
    setType("LIVE");
    setDurationSeconds(10);
  }

  function startEdit(item: LiveMessage) {
    setEditingId(item.id);
    setMessage(item.message);
    setLinkUrl(item.link_url || "");
    setType(item.type || "LIVE");
    setDurationSeconds(item.duration_seconds || 10);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveMessage() {
    if (!message.trim()) {
      alert("Shkruaje mesazhin LIVE.");
      return;
    }

    setLoading(true);

    const payload = {
      message,
      link_url: linkUrl || null,
      type,
      duration_seconds: durationSeconds,
      is_active: true,
    };

    if (editingId) {
      await supabase.from("live_messages").update(payload).eq("id", editingId);
    } else {
      await supabase.from("live_messages").insert({
        ...payload,
        sort_order: messages.length + 1,
      });
    }

    setLoading(false);
    resetForm();
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
        <h1 className="mb-2 text-3xl font-extrabold text-black">
          {editingId ? "Edito LIVE Message" : "LIVE Messages"}
        </h1>

        <p className="mb-6 text-gray-600">
          Menaxho mesazhet që shfaqen në shiritin LIVE të portalit.
        </p>

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

          <div className="grid gap-4 md:grid-cols-2">
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
              <option value="LAJM EKSKLUZIV">LAJM EKSKLUZIV</option>
            </select>

            <select
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              className="w-full rounded border p-3 text-black"
            >
              <option value={5}>5 sekonda</option>
              <option value={10}>10 sekonda</option>
              <option value={15}>15 sekonda</option>
              <option value={20}>20 sekonda</option>
              <option value={30}>30 sekonda</option>
              <option value={40}>40 sekonda</option>
              <option value={60}>60 sekonda</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={saveMessage}
              disabled={loading}
              className="rounded bg-[#d41c3d] px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              {loading
                ? "Duke ruajtur..."
                : editingId
                ? "Ruaj ndryshimet"
                : "Shto LIVE"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded bg-gray-200 px-6 py-3 font-bold text-black"
              >
                Anulo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-2xl font-extrabold text-black">
          Mesazhet LIVE
        </h2>

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
                  <p className="font-extrabold text-black">
                    {item.type} | {item.message}
                  </p>

                  {item.link_url && (
                    <p className="break-all text-sm text-blue-600">
                      {item.link_url}
                    </p>
                  )}

                  <p className="text-sm text-gray-500">
                    {item.duration_seconds}s • Statusi:{" "}
                    {item.is_active ? "Aktiv" : "Jo aktiv"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="rounded bg-blue-100 px-4 py-2 font-bold text-blue-700"
                  >
                    Edito
                  </button>

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