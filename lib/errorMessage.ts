import axios from 'axios';

type ApiErrorResponse = {
  message?: unknown;
  errors?: unknown;
};

const TECHNICAL_MESSAGE =
  /^(?:the given data was invalid\.?|unauthenticated\.?|internal server error\.?|request failed with status code \d+\.?|network error\.?)$/i;
const SENSITIVE_OR_TECHNICAL_DETAILS =
  /sqlstate|pdoexception|stack trace|fatal error|uncaught exception|\/var\/www|\.php:\d+|<!doctype html|<html/i;

function getResponseMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return;
  const message = (data as ApiErrorResponse).message;
  if (typeof message !== 'string') return;

  const trimmed = message.trim();
  if (!trimmed || trimmed.length > 240 || TECHNICAL_MESSAGE.test(trimmed) || SENSITIVE_OR_TECHNICAL_DETAILS.test(trimmed)) {
    return;
  }

  return trimmed;
}

function getValidationMessage(data: unknown): string | undefined {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return;
  const errors = (data as ApiErrorResponse).errors;
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return;

  const firstError = Object.values(errors).flatMap((value) => (Array.isArray(value) ? value : [value]))
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0);
  if (!firstError) return;

  if (/required/i.test(firstError)) {
    const field = Object.keys(errors)[0]?.split('.').at(-1);
    const labels: Record<string, string> = {
      email: 'Alamat email',
      name: 'Nama',
      password: 'Kata sandi',
      phone: 'Nomor telepon',
      subject: 'Subjek',
      message: 'Pesan',
    };
    return `${labels[field ?? ''] ?? 'Kolom yang wajib diisi'} wajib diisi.`;
  }
  if (/valid email|email address/i.test(firstError)) return 'Masukkan alamat email dengan format yang benar.';
  if (/confirmation does not match|confirmed/i.test(firstError)) return 'Konfirmasi kata sandi tidak cocok.';
  if (/at least \d+ characters/i.test(firstError)) return 'Kata sandi belum memenuhi jumlah karakter minimum.';

  return;
}

export function getUserFacingErrorMessage(error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.'): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;

  const status = error.response?.status;
  const responseMessage = getResponseMessage(error.response?.data);

  if (status === 401) {
    if (error.config?.url?.includes('/login')) {
      return responseMessage ?? 'Nama pengguna atau kata sandi tidak sesuai.';
    }
    return responseMessage ?? 'Sesi Anda berakhir. Silakan masuk kembali.';
  }
  if (status === 403) {
    return responseMessage ?? 'Anda tidak memiliki izin untuk melakukan tindakan ini.';
  }
  if (status === 413) {
    return responseMessage ?? 'Ukuran file terlalu besar. Pilih file yang lebih kecil.';
  }
  if (status === 422) {
    if (!responseMessage || /data (?:yang )?diberikan tidak valid/i.test(responseMessage) || /^the .+ field (?:is|required)|^the .+ must /i.test(responseMessage)) {
      return getValidationMessage(error.response?.data) ?? 'Periksa kembali data yang Anda masukkan.';
    }
  }
  if (status === 429) {
    return responseMessage ?? 'Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.';
  }
  if (status && status >= 500) {
    return 'Terjadi gangguan pada server. Silakan coba lagi beberapa saat.';
  }
  if (responseMessage) return responseMessage;

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'Permintaan terlalu lama diproses. Silakan coba lagi.';
  }
  if (!error.response) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.';
  }
  if (status === 404) {
    return 'Data atau halaman yang diminta tidak ditemukan.';
  }

  return fallback;
}
