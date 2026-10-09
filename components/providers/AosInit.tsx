'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import AOS from 'aos';
import 'aos/dist/aos.css';

const AOS_OPTIONS = {
  duration: 900,
  easing: 'ease-out-quart',
  once: true,
  offset: 100,
  delay: 0,
  // Matikan MutationObserver internal AOS: ia menambah class ke node DOM
  // kapan pun (termasuk konten streaming yang belum di-hydrate React)
  // dan itulah sumber warning hydration-mismatch yang persisten.
  // Sebagai gantinya kita panggil refreshHard() manual di bawah.
  disableMutationObserver: true,
  disable: () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
} as const;

// Rangkaian refresh bertahap agar konten streaming yang datang
// terlambat tetap terdaftar animasinya. Idempoten & aman karena
// selalu berjalan pasca-commit React, bukan saat hydrasi.
function runRefreshChain(register: (t: ReturnType<typeof setTimeout>) => void, disposed: () => boolean) {
  const refreshHard = () => {
    if (!disposed()) AOS.refreshHard();
  };
  refreshHard();
  for (const ms of [500, 1500, 3500]) {
    register(setTimeout(refreshHard, ms));
  }
}

/**
 * Inisialisasi global Animate On Scroll (AOS).
 * - Durasi 900ms + easing quart: gerak mentega yang elegan.
 * - `once: true`: animasi sekali jalan, tidak mengulang saat scroll naik-turun.
 * - Init + refresh pertama ditunda sampai setelah window `load` agar tidak
 *   balapan dengan hydrasi React (class aos-init/aos-animate yang ditulis
 *   terlalu dini = warning hydration-mismatch).
 * - Refresh tiap pindah halaman (App Router tidak reload penuh).
 * - Nonaktif total untuk prefers-reduced-motion.
 */
export default function AosInit() {
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    let disposed = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const register = (t: ReturnType<typeof setTimeout>) => {
      timers.push(t);
    };

    const init = () => {
      if (disposed) return;
      AOS.init({ ...AOS_OPTIONS });
      runRefreshChain(register, () => disposed);
    };
    // Beri hydrasi kesempatan selesai dulu sebelum AOS menyentuh DOM.
    const schedule = () => {
      timers.push(setTimeout(init, 120));
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
      window.removeEventListener('load', schedule);
    };
  }, []);

  useEffect(() => {
    // Lewati mount awal (sudah ditangani rangkaian init di atas).
    // Hanya untuk navigasi client-side — render-nya murni client
    // (tanpa hydrasi) sehingga refresh langsung aman.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    let disposed = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    runRefreshChain(
      (t) => timers.push(t),
      () => disposed,
    );
    return () => {
      disposed = true;
      timers.forEach(clearTimeout);
    };
  }, [pathname]);

  return null;
}
