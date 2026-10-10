/**
 * Skeleton layar pemuatan untuk halaman list publik.
 * Tampil saat navigasi antar halaman selagi data diambil server.
 */
export default function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-28 pb-20" aria-busy="true" aria-label="Memuat halaman">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Breadcrumb + judul */}
        <div className="pt-4 pb-6 animate-pulse">
          <div className="h-4 w-48 bg-slate-200 rounded-full mb-4" />
          <div className="border-b border-[#0f172a]/10 pb-4 mb-6">
            <div className="h-8 w-64 bg-slate-200 rounded-xl" />
          </div>
        </div>
        {/* Grid kartu */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-[16/9] bg-slate-200" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-11/12 bg-slate-200 rounded-lg" />
                <div className="h-5 w-2/3 bg-slate-200 rounded-lg" />
                <div className="h-4 w-full bg-slate-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
