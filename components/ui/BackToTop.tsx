'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Tombol kembali ke atas — muncul setelah scroll 600px,
 * halus, dan ramah keyboard/screen reader.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setVisible(window.scrollY > 600);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
      className={`fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#c20000] hover:bg-[#a30000] text-white shadow-lg shadow-[#c20000]/30 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
