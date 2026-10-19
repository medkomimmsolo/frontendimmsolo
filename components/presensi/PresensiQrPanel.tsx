'use client';

import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, Copy, Check, RefreshCw, Upload, X, ImageDown, Tv, QrCode, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { siteUrl } from '@/lib/env';
import { getUserFacingErrorMessage } from '@/lib/errorMessage';
import { exportQrPng, renderQrDataUrl, waitQrElementReady, getStoredQrLogo, storeQrLogo } from '@/lib/qrExport';
import { Presensi, PresensiPeserta, PresensiSesi, PresensiStats } from '@/types';
import { PresensiProjectorModal } from '@/components/presensi/PresensiProjectorModal';

interface Props {
  presensi: Presensi;
  peserta: PresensiPeserta[];
  activeSesi?: PresensiSesi | null;
  onRefreshPeserta: () => void;
  stats?: PresensiStats | null;
}

export function PresensiQrPanel({ presensi, peserta, activeSesi, stats }: Props) {
  const [copied, setCopied] = useState(false);
  const [showProjector, setShowProjector] = useState(false);

  // Logo tengah QR peserta (upload mandiri, tersimpan per-browser).
  const [logo, setLogo] = useState<string | null>(null);
  const [pngSize, setPngSize] = useState<number>(1000);
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [generatedPeserta, setGeneratedPeserta] = useState<Set<number>>(() => new Set());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [isSendingPng, setIsSendingPng] = useState<number | null>(null);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [pesanEmail, setPesanEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLogo(getStoredQrLogo());
  }, []);

  // Pulihkan daftar QR yang pernah di-generate tiap masuk/refresh halaman
  // (kunci per presensi; hanya berlaku selama sesi browser ini).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`imm_presensi_qr_generated_${presensi.id}`);
      setGeneratedPeserta(raw ? new Set(JSON.parse(raw) as number[]) : new Set());
    } catch {
      setGeneratedPeserta(new Set());
    }
  }, [presensi.id]);

  // Catat perubahan daftar ke sessionStorage.
  useEffect(() => {
    try {
      sessionStorage.setItem(`imm_presensi_qr_generated_${presensi.id}`, JSON.stringify(Array.from(generatedPeserta)));
    } catch {
      /* sessionStorage bisa diblokir; abaikan. */
    }
  }, [generatedPeserta, presensi.id]);

  const origin = siteUrl();

  const qrUrl = presensi.event_token
    ? `${origin}/presensi/${presensi.event_token}${activeSesi ? `?sesi=${activeSesi.id}` : ''}`
    : '';

  const copyLink = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link disalin');
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal menyalin'));
    }
  };

  /** Unduh QR form presensi (kartu besar) sebagai PNG — kompatibel dibuka di galeri foto. */
  const downloadQr = async () => {
    try {
      await exportQrPng({
        svgId: 'qr-form-presensi',
        fileName: `qr-presensi-${presensi.slug}`,
        size: 1000,
      });
      toast.success('QR form presensi diunduh');
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal mengunduh QR'));
    }
  };

  const canSelf = presensi.mode === 'self' || presensi.mode === 'both';
  const canScan = presensi.mode === 'scan' || presensi.mode === 'both';

  /** Baca file logo → data URL (dibatasi ukurannya agar tetap ringan). */
  const handleLogoFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (PNG/JPG).');
      return;
    }
    if (f.size > 1_500_000) {
      toast.error('Ukuran logo maksimal 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setLogo(dataUrl);
      storeQrLogo(dataUrl);
      toast.success('Logo dipasang di tengah QR');
    };
    reader.onerror = () => toast.error('Gagal membaca file logo');
    reader.readAsDataURL(f);
  };

  const clearLogo = () => {
    setLogo(null);
    storeQrLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Logo dihapus');
  };

  const generateQr = (pesertaId: number) => {
    setGeneratedPeserta((current) => new Set(current).add(pesertaId));
  };

  const generateAllQr = async () => {
    setIsGeneratingAll(true);
    try {
      for (const p of peserta) {
        setGeneratedPeserta((current) => new Set(current).add(p.id));
        await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
      }
      toast.success(`QR dibuat untuk ${peserta.length} peserta di halaman ini`);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  /** Unduh PNG yang hanya berisi QR dan logo opsional; nama dipakai untuk nama file. */
  const downloadPesertaPng = async (p: PresensiPeserta) => {
    setIsDownloading(p.id);
    try {
      await exportQrPng({
        svgId: `qr-peserta-${p.id}`,
        fileName: p.nama,
        size: pngSize,
        logoDataUrl: logo,
      });
      toast.success(`QR ${p.nama} diunduh`);
    } catch (error) {
      toast.error((error as Error).message || 'Gagal mengunduh PNG');
    } finally {
      setIsDownloading(null);
    }
  };

  /** Unduh semua kartu peserta sekaligus (diberi jeda agar browser tidak blokir). */
  const downloadAllPng = async () => {
    const generated = peserta.filter((p) => generatedPeserta.has(p.id));
    if (generated.length === 0) return;
    for (const p of generated) {
      await downloadPesertaPng(p);
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  // ── Kirim QR via email ──

  /** Pastikan QR peserta ter-render penuh, lalu ubah menjadi data URL PNG. */
  const renderPesertaQr = async (p: PresensiPeserta): Promise<string> => {
    setGeneratedPeserta((current) => new Set(current).add(p.id));
    await waitQrElementReady(`qr-peserta-${p.id}`);
    return renderQrDataUrl({
      svgId: `qr-peserta-${p.id}`,
      fileName: p.nama,
      size: 600,
      logoDataUrl: logo,
    });
  };

  const postSendQr = async (items: { peserta_id: number; nama: string; email: string; kode: string | null; png: string; pesan: string }[]) => {
    const res = await api.post(`/presensi/${presensi.id}/peserta/send-qr`, { items });
    const data = res.data?.data as { sent: number; failed_count: number; failed_emails: string[] } | undefined;
    const sent = data?.sent ?? 0;
    const failed = data?.failed_emails ?? [];
    if (sent > 0) {
      if (failed.length > 0) {
        toast.success(`${sent} email terkirim. ${failed.length} gagal dikirim (${failed.slice(0, 2).join(', ')}${failed.length > 2 ? ', …' : ''})`);
      } else {
        toast.success(`${sent} email QR berhasil dikirim.`);
      }
    } else {
      toast.error('Tidak ada email QR yang terkirim. Periksa pengaturan mail server.');
    }
    return sent;
  };

  /** Kirim QR satu peserta ke emailnya. */
  const kirimEmailPeserta = async (p: PresensiPeserta) => {
    if (!p.email || isSendingPng) return;
    setIsSendingPng(p.id);
    try {
      const png = await renderPesertaQr(p);
      await postSendQr([{ peserta_id: p.id, nama: p.nama, email: p.email, kode: p.kode, png, pesan: pesanEmail.trim() }]);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal mengirim email QR'));
    } finally {
      setIsSendingPng(null);
    }
  };

  /** Kirim QR seluruh peserta (halaman ini) yang punya e-mail, ke email masing-masing. */
  const kirimEmailSemua = async () => {
    const list = peserta.filter((p) => p.email).slice(0, 100);
    if (list.length === 0 || isSendingAll) return;
    setIsSendingAll(true);
    const toastId = toast.loading(`Menyiapkan QR untuk ${list.length} peserta…`);
    try {
      const items: { peserta_id: number; nama: string; email: string; kode: string | null; png: string; pesan: string }[] = [];
      for (const p of list) {
        toast.loading(`Menyiapkan QR ${p.nama} (${items.length + 1}/${list.length})…`, { id: toastId });
        const png = await renderPesertaQr(p);
        items.push({ peserta_id: p.id, nama: p.nama, email: p.email ?? '', kode: p.kode, png, pesan: pesanEmail.trim() });
      }
      toast.loading(`Mengirim ${items.length} email…`, { id: toastId });
      await postSendQr(items);
    } catch (error) {
      toast.error(getUserFacingErrorMessage(error, 'Gagal mengirim email QR'), { id: toastId });
    } finally {
      toast.dismiss(toastId);
      setIsSendingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {canSelf && (
        <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#c20000]" /> QR Form Presensi
              {activeSesi && <span className="text-xs font-bold text-[#c20000]">· {activeSesi.name}</span>}
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              QR ini langsung membuka form presensi publik. Peserta tidak perlu login atau memindai QR peserta.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex flex-col items-center">
              <div className="bg-white p-5 border-2 border-slate-100 rounded-2xl shadow-sm">
                {qrUrl ? (
                  <QRCodeSVG id="qr-form-presensi" value={qrUrl} size={220} level="M" />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center text-sm text-slate-400">
                    Link presensi belum tersedia
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <p className="text-sm text-slate-600">
                Tampilkan atau cetak QR ini. Saat dipindai, peserta langsung membuka dan mengisi form presensi.
                Anti-titip-absen {presensi.enforce_device_limit !== false ? <strong>aktif</strong> : <span className="text-slate-400">nonaktif</span>}: satu perangkat hanya untuk satu peserta.
              </p>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <code className="text-xs text-slate-600 flex-1 truncate">{qrUrl}</code>
                <button onClick={() => copyLink(qrUrl)} disabled={!qrUrl} className="text-slate-500 hover:text-[#c20000] disabled:opacity-40" aria-label="Salin tautan form presensi">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button onClick={() => setShowProjector(true)} className="h-10 px-4 bg-[#c20000] hover:bg-[#a30000] text-white rounded-xl text-xs font-bold">
                  <Tv className="w-4 h-4 mr-1.5" /> Mode Layar Penuh (Proyektor)
                </Button>
                <Button onClick={downloadQr} disabled={!qrUrl} variant="outline" className="h-10 px-4 rounded-xl text-xs font-bold">
                  <Download className="w-4 h-4 mr-1.5" /> Unduh QR
                </Button>
              </div>
              <p className="text-xs text-slate-400">
                QR tetap berlaku selama tautan presensi aktif. Akses publik dibatasi ke sesi ini; data kehadiran tetap tercatat di dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {canScan && (
        <Card className="border-slate-200/90 rounded-2xl shadow-2xs">
          <CardHeader>
            <CardTitle className="text-base">QR Unik per Peserta — Scan Petugas</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              Pilih logo terlebih dahulu jika diperlukan, lalu klik Generate untuk membuat QR. QR yang pernah dibuat tetap tampil meski halaman di-refresh (hanya selama sesi browser ini). Unduhan hanya berisi QR (tanpa nama atau keterangan); nama peserta digunakan sebagai nama file. Menampilkan {peserta.length} peserta di halaman ini. QR juga bisa dikirim ke email peserta (tombol Kirim) — hanya untuk peserta yang punya alamat e-mail. Anda bisa menyiapkan pesan utama (opsional) yang ikut tampil menonjol di dalam email.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Pengaturan ekspor ID card */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {logo ? (
                    <img src={logo} alt="Logo QR" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 text-center leading-tight px-1">Tanpa<br />logo</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800">Logo tengah QR</div>
                  <div className="text-xs text-slate-500">PNG/JPG ≤ 1.5 MB. QR memakai koreksi error tinggi agar tetap terbaca.</div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => handleLogoFile(e.target.files?.[0] || null)}
              />
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-9 px-3 rounded-lg text-xs font-bold">
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> {logo ? 'Ganti Logo' : 'Pilih Logo'}
                </Button>
                {logo && (
                  <button onClick={clearLogo} title="Hapus logo" className="h-9 w-9 inline-flex items-center justify-center text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <select
                  value={pngSize}
                  onChange={(e) => setPngSize(Number(e.target.value))}
                  className="h-9 bg-white border border-slate-200 rounded-lg px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#c20000]"
                  title="Ukuran PNG"
                >
                  <option value={600}>PNG 600px</option>
                  <option value={1000}>PNG 1000px</option>
                  <option value={1600}>PNG 1600px (cetak)</option>
                </select>
                <Button onClick={generateAllQr} disabled={peserta.length === 0 || isGeneratingAll} variant="outline" className="h-9 px-3 rounded-lg text-xs font-bold">
                  {isGeneratingAll ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5 mr-1.5" />}
                  Generate Semua QR
                </Button>
                <Button onClick={downloadAllPng} disabled={!peserta.some((p) => generatedPeserta.has(p.id))} variant="outline" className="h-9 px-3 rounded-lg text-xs font-bold">
                  <ImageDown className="w-3.5 h-3.5 mr-1.5" /> Unduh QR yang Dibuat
                </Button>
                <Button
                  onClick={kirimEmailSemua}
                  disabled={!peserta.some((p) => p.email) || isSendingAll}
                  className="h-9 px-3 rounded-lg text-xs font-bold bg-[#c20000] hover:bg-[#a30000] text-white disabled:bg-slate-200 disabled:text-slate-400"
                  title="Kirim QR personal ke email tiap peserta yang punya alamat e-mail"
                >
                  {isSendingAll ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Mail className="w-3.5 h-3.5 mr-1.5" />}
                  Kirim QR via Email
                </Button>
              </div>
            </div>

            {/* Pesan utama opsional yang muncul di dalam email QR */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <label htmlFor="pesan-email-qr" className="block text-xs font-bold text-slate-600 mb-1.5">
                Pesan utama untuk email QR (opsional)
              </label>
              <textarea
                id="pesan-email-qr"
                value={pesanEmail}
                onChange={(e) => setPesanEmail(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Contoh: QR ini untuk presensi Sabtu pukul 08.00. Tunjukkan kepada petugas di meja registrasi."
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-[#c20000] resize-y"
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] text-slate-400">
                  Ditampilkan menonjol di dalam email yang dikirim ke peserta.
                </span>
                <span className="text-[11px] text-slate-400 tabular-nums">{pesanEmail.length}/500</span>
              </div>
            </div>

            {peserta.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Belum ada peserta. Impor peserta terlebih dahulu.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {peserta.map((p) => (
                  <div key={p.id} className="border border-slate-200 rounded-xl p-3 text-center bg-white">
                    {generatedPeserta.has(p.id) ? (
                      <div className="relative mx-auto h-[120px] w-[120px]">
                        <QRCodeSVG id={`qr-peserta-${p.id}`} value={`presensi:${presensi.id}:${p.token}`} size={120} level="H" marginSize={2} className="mx-auto" />
                        {logo && (
                          <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-[27px] w-[27px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md bg-white p-1">
                            <img src={logo} alt="" className="h-full w-full object-contain" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-[120px] items-center justify-center rounded-lg bg-slate-50">
                        <Button onClick={() => generateQr(p.id)} variant="outline" className="h-8 px-3 text-xs font-bold">
                          <QrCode className="mr-1.5 h-3.5 w-3.5" /> Generate
                        </Button>
                      </div>
                    )}
                    <div className="mt-2 text-sm font-semibold text-slate-800 line-clamp-1">{p.nama}</div>
                    {p.kode && <div className="text-xs text-slate-400">Kode {p.kode}</div>}
                  <div className="w-full space-y-1.5">
                    {generatedPeserta.has(p.id) && (
                      <Button
                        onClick={() => downloadPesertaPng(p)}
                        disabled={isDownloading === p.id}
                        variant="outline"
                        className="h-8 px-3 rounded-lg text-[11px] font-bold w-full"
                      >
                        {isDownloading === p.id ? (
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Unduh QR
                      </Button>
                    )}
                    {p.email && generatedPeserta.has(p.id) && (
                      <Button
                        onClick={() => kirimEmailPeserta(p)}
                        disabled={isSendingPng !== null || isSendingAll}
                        variant="outline"
                        className="h-8 px-3 rounded-lg text-[11px] font-bold w-full text-[#c20000] border-[#c20000]/40 hover:bg-[#c20000]/5"
                      >
                        {isSendingPng === p.id ? (
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Kirim Email
                      </Button>
                    )}
                  </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!canSelf && !canScan && (
        <p className="text-sm text-slate-400">Mode QR tidak aktif untuk sesi ini.</p>
      )}

      <PresensiProjectorModal
        isOpen={showProjector}
        onClose={() => setShowProjector(false)}
        presensi={presensi}
        activeSesi={activeSesi}
        qrUrl={qrUrl}
        stats={stats}
      />
    </div>
  );
}
