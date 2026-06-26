const fs = require('fs');

function processFile(file, setterName) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Add import if missing
  if (!content.includes("import { convertToWebP }")) {
    content = content.replace("import toast from 'react-hot-toast';", "import toast from 'react-hot-toast';\nimport { convertToWebP } from '@/lib/imageUtils';");
  }

  // Use regex to find handleFileChange and replace it
  const regex = /const handleFileChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?set[a-zA-Z]+\(e\.target\.files\[0\]\);[\s\S]*?\};/g;

  const newFunc = `const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    try {
      const webpFile = await convertToWebP(file);
      if (webpFile.size > 2 * 1024 * 1024) {
        toast.error('Setelah dikonversi, ukuran gambar masih lebih dari 2MB. Silakan pilih gambar dengan resolusi lebih kecil.');
        return;
      }
      ${setterName}(webpFile);
    } catch (error) {
      console.error('Failed to process image:', error);
      toast.error('Gagal memproses gambar');
    }
  };`;

  if (!content.includes('await convertToWebP(file)') && content.match(regex)) {
    content = content.replace(regex, newFunc);
    fs.writeFileSync(file, content);
    console.log('Processed ' + file);
  } else {
    console.log('Skipped ' + file);
  }
}

processFile('app/dashboard/lembaga/create/page.tsx', 'setLogo');
processFile('app/dashboard/lembaga/[id]/page.tsx', 'setLogo');
processFile('app/dashboard/struktural/create/page.tsx', 'setFoto');
processFile('app/dashboard/struktural/[id]/page.tsx', 'setFoto');
