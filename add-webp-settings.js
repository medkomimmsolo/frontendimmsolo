const fs = require('fs');

let file = 'app/dashboard/settings/page.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Add import if missing
  if (!content.includes("import { convertToWebP }")) {
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { convertToWebP } from '@/lib/imageUtils';");
  }

  // Replace handleLogoUpload
  const logoRegex = /const handleLogoUpload = async \(e: React\.ChangeEvent<HTMLInputElement>, type: 'color' \| 'white' \| 'icon'\) => \{\s*if \(!e\.target\.files \|\| e\.target\.files\.length === 0\) return;\s*const file = e\.target\.files\[0\];/;
  const newLogoFunc = `const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'color' | 'white' | 'icon') => {
      if (!e.target.files || e.target.files.length === 0) return;
      let file = e.target.files[0];

      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      try {
        file = await convertToWebP(file);
      } catch (err) {
        console.error('WebP conversion failed', err);
        toast.error('Gagal memproses gambar');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('Setelah dikonversi, ukuran gambar masih lebih dari 2MB. Silakan pilih gambar dengan resolusi lebih kecil.');
        return;
      }`;
  
  if (content.match(logoRegex) && !content.includes("let file = e.target.files[0];")) {
    content = content.replace(logoRegex, newLogoFunc);
  }

  // Replace handlePhotoUpload
  const photoRegex = /const handlePhotoUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{\s*if \(!e\.target\.files \|\| e\.target\.files\.length === 0\) return;\s*const file = e\.target\.files\[0\];/;
  const newPhotoFunc = `const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      let file = e.target.files[0];

      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }

      try {
        file = await convertToWebP(file);
      } catch (err) {
        console.error('WebP conversion failed', err);
        toast.error('Gagal memproses gambar');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('Setelah dikonversi, ukuran gambar masih lebih dari 2MB. Silakan pilih gambar dengan resolusi lebih kecil.');
        return;
      }`;
      
  if (content.match(photoRegex)) {
    content = content.replace(photoRegex, newPhotoFunc);
  }

  fs.writeFileSync(file, content);
  console.log('Processed settings page');
}
