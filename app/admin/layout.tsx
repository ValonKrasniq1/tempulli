import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-black">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col p-6">
            <h2 className="mb-8 text-3xl font-extrabold text-[#d41c3d]">
              Tempulli
            </h2>

            <nav className="flex-1 space-y-1 text-sm font-bold">
              <Link href="/admin" className="block rounded-xl bg-[#d41c3d] px-4 py-3 text-white">
                Dashboard
              </Link>

              <Link href="/admin/articles" className="block rounded-xl px-4 py-3 hover:bg-gray-100">
  Articles
</Link>

              <Link href="/admin/breaking" className="block rounded-xl px-4 py-3 hover:bg-gray-100">
                Breaking News
              </Link>

              <Link href="/admin/live" className="block rounded-xl px-4 py-3 hover:bg-gray-100">
                LIVE Updates
              </Link>

              <Link href="/admin/campaigns" className="block rounded-xl px-4 py-3 hover:bg-gray-100">
                Campaigns
              </Link>

              <Link href="/admin/billboard" className="block rounded-xl px-4 py-3 hover:bg-gray-100">
                Billboard Ads
              </Link>

              <div className="pt-4 text-xs font-extrabold uppercase text-gray-400">
                Coming soon
              </div>

              <Link href="/admin" className="block rounded-xl px-4 py-3 text-gray-400">
                Analytics
              </Link>

              <Link href="/admin" className="block rounded-xl px-4 py-3 text-gray-400">
                SEO
              </Link>

              <Link href="/admin" className="block rounded-xl px-4 py-3 text-gray-400">
                Settings
              </Link>
            </nav>

            <a
              href="/"
              target="_blank"
              className="mt-6 rounded-xl border border-[#d41c3d] px-4 py-3 text-center text-sm font-extrabold text-[#d41c3d]"
            >
              Shiko faqen ↗
            </a>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-6 py-6 lg:px-10">
          {children}
        </section>
      </div>
    </main>
  );
}