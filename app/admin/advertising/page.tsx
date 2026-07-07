import Link from "next/link";

export default function AdvertisingPage() {
  const placements = [
    ["campaign", "Campaign Banner"],
    ["billboard", "Billboard Banner"],
    ["hero", "Hero Inline Banner"],
    ["latest-news", "Latest News Banner"],
    ["sidebar", "Sidebar Banner"],
    ["sticky-mobile", "Sticky Mobile Banner"],
    ["footer", "Footer Banner"],
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-[#d41c3d]">
          Advertising Manager
        </h1>
        <p className="mt-2 text-gray-500">
          Menaxho të gjitha reklamat e portalit.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {placements.map(([position, name]) => (
          <div key={position} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">{name}</h2>
            <p className="mt-2 text-sm text-gray-500">Pozicioni: {position}</p>

            <Link
              href={`/admin/advertising/${position}`}
              className="mt-5 inline-block rounded-lg bg-[#d41c3d] px-4 py-2 text-sm font-bold text-white"
            >
              Manage
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}