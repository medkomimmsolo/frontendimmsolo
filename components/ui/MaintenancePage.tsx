import { ShieldAlert, Construction, Lock } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 md:p-12 text-center border border-slate-100">
        
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <Construction className="w-12 h-12 text-[#c20000]" />
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
            <Lock className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-4" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
          Sedang Dalam Perbaikan
        </h1>
        
        <p className="text-slate-600 mb-8 leading-relaxed text-lg">
          Mohon maaf, website PC IMM Kota Surakarta saat ini sedang dalam <strong>tahap pemeliharaan (maintenance)</strong>. Kami akan segera kembali!
        </p>

        <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
          <p className="text-sm text-slate-500 font-medium">
            Jika Anda adalah Super Admin, Anda masih dapat mengakses sistem melalui halaman login.
          </p>
        </div>

        <Link 
          href="/login"
          className="inline-flex items-center justify-center px-8 py-3 bg-[#0f172a] hover:bg-[#c20000] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-slate-200"
        >
          Login Admin
        </Link>
      </div>
      
      <div className="mt-8 text-sm text-slate-400 font-medium">
        &copy; {new Date().getFullYear()} PC IMM Kota Surakarta
      </div>
    </main>
  );
}
