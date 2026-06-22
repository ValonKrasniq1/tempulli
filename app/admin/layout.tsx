import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 rounded-xl bg-white p-5 shadow lg:block">
          <h2 className="mb-6 text-2xl font-bold text-[#d41c3d]">Tempulli</h2>

          <nav className="space-y-2 text-sm font-bold">
            <Link href="/admin" className="block rounded p-3 hover:bg-gray-100">
              Dashboard
            </Link>
            <Link href="/admin/live" className="block rounded p-3 hover:bg-gray-100">
              LIVE Messages
            </Link>
            <Link href="/admin/breaking" className="block rounded p-3 hover:bg-gray-100">
              Breaking News
            </Link>
          </nav>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </main>
  );
}