'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'list',
  'bullet',
  'align',
  'link',
  'image',
];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="bg-white rounded-sm border border-[#0f172a]/10 focus-within:border-imm-red-500 focus-within:ring-1 focus-within:ring-imm-red-500 transition-colors">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="min-h-[300px]"
      />
      <style jsx global>{`
        .quill {
          display: flex;
          flex-direction: column;
        }
        .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid rgba(15, 23, 42, 0.1);
          padding: 12px;
          border-top-left-radius: 0.125rem;
          border-top-right-radius: 0.125rem;
        }
        .ql-container.ql-snow {
          border: none;
          flex: 1;
          min-height: 300px;
          font-family: inherit;
          font-size: 1rem;
        }
        .ql-editor {
          min-height: 300px;
        }
        .ql-editor:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
