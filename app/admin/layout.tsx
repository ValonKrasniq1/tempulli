import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-100 text-black">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 rounded-2xl bg-white p-6 shadow lg:block">
          <h2 className="mb-8 text-3xl font-extrabold text-[#d41c3d]">
            Tempulli
          </h2>

          <nav className="space-y-2 text-base font-extrabold text-black">
            <Link href="/admin" className="block rounded-xl p-3 hover:bg-gray-100">
              Dashboard
            </Link>

            <Link href="/admin/live" className="block rounded-xl p-3 hover:bg-gray-100">
              LIVE Messages
            </Link>

            <Link href="/admin/breaking" className="block rounded-xl p-3 hover:bg-gray-100">
              Breaking News
            </Link>

            <Link href="/admin/campaigns" className="block rounded-xl p-3 hover:bg-gray-100">
              Campaigns
            </Link>
          </nav>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}