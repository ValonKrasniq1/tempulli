export default function LivePage() {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h1 className="mb-6 text-3xl font-bold">
        LIVE Messages
      </h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Mesazhi LIVE"
          className="w-full rounded border p-3"
        />

        <input
          type="text"
          placeholder="Link (opsionale)"
          className="w-full rounded border p-3"
        />

        <select className="w-full rounded border p-3">
          <option>LIVE</option>
          <option>MARKETING</option>
          <option>SPORT</option>
          <option>EVENT</option>
        </select>

        <button className="rounded bg-[#d41c3d] px-6 py-3 text-white">
          Shto LIVE
        </button>
      </div>
    </div>
  );
}