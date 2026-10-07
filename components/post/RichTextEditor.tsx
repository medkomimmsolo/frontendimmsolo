'use client';

import React, { useMemo, useRef, useEffect, type Ref } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import TableUp, {
  TableAlign,
  TableMenuContextmenu,
  TableResizeBox,
  TableResizeScale,
  TableSelection,
} from 'quill-table-up';
import toast from 'react-hot-toast';
import 'react-quill-new/dist/quill.snow.css';
import 'quill-table-up/index.css';
import 'quill-table-up/table-creator.css';

const MODULE_NAME: string = (TableUp as any).moduleName;

/** Daftarkan blot & modul tabel sekali saja ke instance Quill yang dipakai react-quill-new. */
let tableRegistered = false;
function ensureTableRegistered() {
  if (tableRegistered) return;
  tableRegistered = true;
  (Quill as any).register({ [`modules/${MODULE_NAME}`]: TableUp }, true);
  if (typeof (TableUp as any).register === 'function') {
    (TableUp as any).register();
  }
}

const TABLE_TEXTS_ID = {
  fullCheckboxText: 'Tabel lebar penuh',
  customBtnText: 'Kustom',
  confirmText: 'OK',
  cancelText: 'Batal',
  rowText: 'Baris',
  colText: 'Kolom',
  notPositiveNumberError: 'Masukkan bilangan bulat positif',
  custom: 'Kustom',
  clear: 'Hapus',
  transparent: 'Transparan',
  InsertTop: 'Sisipkan baris di atas',
  InsertRight: 'Sisipkan kolom di kanan',
  InsertBottom: 'Sisipkan baris di bawah',
  InsertLeft: 'Sisipkan kolom di kiri',
  MergeCell: 'Gabung sel',
  SplitCell: 'Pisah sel',
  DeleteRow: 'Hapus baris',
  DeleteColumn: 'Hapus kolom',
  DeleteTable: 'Hapus tabel',
  BackgroundColor: 'Warna latar sel',
  BorderColor: 'Warna garis tabel',
  SwitchWidth: 'Ubah lebar tabel',
  InsertCaption: 'Sisipkan judul tabel',
  ToggleTdBetweenTh: 'Ubah th/td',
};

/** Opsi TableUp: resize kolom via drag handle, resize tabel via scale, selection multi-sel, klik kanan. */
const TABLE_UP_OPTIONS = {
  full: false,           // false = lebar tabel bisa bebas (bukan paksa 100%)
  texts: TABLE_TEXTS_ID,
  customButton: '3×3',   // label tombol picker default
  modules: [
    {
      module: TableResizeBox,    // drag handle di tepi kolom untuk ubah lebar kolom
    },
    {
      module: TableResizeScale,  // handle pojok kanan-bawah untuk scale keseluruhan tabel
    },
    {
      module: TableSelection,    // seleksi multi-sel (highlight biru)
    },
    {
      module: TableAlign,        // rata kiri/tengah/kanan untuk tabel
    },
    {
      module: TableMenuContextmenu,  // klik kanan → menu konteks lengkap
      // Semua opsi menu diaktifkan secara default oleh TableMenuContextmenu
    },
  ],
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  modules: any;
  formats: string[];
  placeholder?: string;
  containerRef?: Ref<HTMLDivElement>;
}

/** Menyisipkan konfigurasi modul tabel ke konfigurasi Quill yang sudah ada. */
export function mergeTableModules(modules: any) {
  const next: Record<string, any> = { ...(modules || {}) };
  if (!next[MODULE_NAME]) next[MODULE_NAME] = TABLE_UP_OPTIONS;
  return next;
}

export default function RichTextEditor({
  value,
  onChange,
  modules,
  formats,
  placeholder,
  containerRef,
}: RichTextEditorProps) {
  ensureTableRegistered();

  const innerRef = useRef<HTMLDivElement>(null);
  const mergedModules = useMemo(() => mergeTableModules(modules), [modules]);

  // Tambahkan tombol "Sisipkan Tabel" custom ke toolbar setelah mount,
  // karena handler harus punya akses ke container ref yang benar.
  useEffect(() => {
    const container = innerRef.current;
    if (!container) return;

    const toolbar = container.querySelector('.ql-toolbar');
    if (!toolbar || toolbar.querySelector('.ql-table-insert-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ql-table-insert-btn';
    btn.title = 'Sisipkan Tabel';
    btn.innerHTML = `<svg viewBox="0 0 18 18" style="width:16px;height:16px;display:inline-block;vertical-align:middle">
      <rect x="1" y="1" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <rect x="10" y="1" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <rect x="1" y="10" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <rect x="10" y="10" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/>
    </svg>`;
    btn.style.cssText = 'padding:2px 4px;cursor:pointer;display:inline-flex;align-items:center;';

    btn.addEventListener('click', () => {
      const qlContainer = container.querySelector('.ql-container');
      const quill: any = qlContainer ? (Quill as any).find(qlContainer) : null;
      if (!quill) return;

      const tableModule = quill.getModule(MODULE_NAME);
      const editor = qlContainer!.querySelector('.ql-editor');

      function tryInsert() {
        try {
          const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };
          quill.setSelection(range.index, 0);
          tableModule.insertTable(3, 3);
          return true;
        } catch (err: any) {
          return false;
        }
      }

      // Coba langsung; jika gagal karena kursor di dalam tabel, geser ke luar dulu
      if (tryInsert()) return;

      if (editor) {
        // Dorong kursor ke akhir dokumen (di luar tabel mana pun)
        const lastIdx = quill.getLength();
        quill.setSelection(lastIdx - 1, 0);
      }

      if (!tryInsert()) {
        toast.error('Tidak dapat menyisipkan tabel — pindahkan kursor keluar tabel lalu coba lagi.');
      }
    });

    // Tambahkan ke grup terakhir toolbar
    const groups = toolbar.querySelectorAll('.ql-formats');
    const lastGroup = groups[groups.length - 1];
    if (lastGroup) {
      lastGroup.appendChild(btn);
    } else {
      const span = document.createElement('span');
      span.className = 'ql-formats';
      span.appendChild(btn);
      toolbar.appendChild(span);
    }
  }, []);

  return (
    <div
      ref={(node) => {
        // Gabungkan innerRef (untuk handler tabel) dan containerRef (untuk parent)
        (innerRef as any).current = node;
        if (typeof containerRef === 'function') containerRef(node);
        else if (containerRef && 'current' in containerRef) {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={mergedModules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
