export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <h2 className="text-3xl font-bold text-[#d41c3d]">TEMPULLI</h2>
          <p className="mt-3 text-sm text-gray-300">
            Portali informativ i Luginës, Kosovës dhe më gjerë.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-bold">Kategoritë</h3>
          <p className="text-sm text-gray-300">Lajme • Lugina • Kosovë • Sport • Teknologji</p>
        </div>

        <div>
          <h3 className="mb-3 font-bold">Na ndiqni</h3>
          <p className="text-sm text-gray-300">Facebook • Instagram • TikTok • YouTube</p>
        </div>
      </div>
    </footer>
  );
}