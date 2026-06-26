const fs = require('fs');

const files = [
  'app/dashboard/blog/[id]/page.tsx',
  'app/dashboard/blog/create/page.tsx',
  'app/dashboard/events/[id]/page.tsx',
  'app/dashboard/events/create/page.tsx',
  'app/dashboard/lembaga/[id]/page.tsx',
  'app/dashboard/lembaga/create/page.tsx',
  'app/dashboard/struktural/[id]/page.tsx',
  'app/dashboard/struktural/create/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  // First, remove the old size check that happens before conversion
  const oldSizeCheck = `    if (file.size > 2 * 1024 * 1024) {\n      toast.error('Ukuran gambar maksimal 2MB. Silakan pilih gambar yang lebih kecil.');\n      return;\n    }\n`;
  content = content.split(oldSizeCheck).join('');
  
  // Now, inject the new size check AFTER conversion
  // Look for: const webpFile = await convertToWebP(file);
  const target = `const webpFile = await convertToWebP(file);`;
  const replacement = `const webpFile = await convertToWebP(file);\n\n      if (webpFile.size > 2 * 1024 * 1024) {\n        toast.error('Setelah dikonversi, ukuran gambar masih lebih dari 2MB. Silakan pilih gambar dengan resolusi lebih kecil.');\n        return;\n      }`;
  
  if (content.includes(target) && !content.includes('Setelah dikonversi, ukuran gambar masih lebih dari 2MB')) {
    content = content.replace(target, replacement);
    fs.writeFileSync(file, content);
    console.log('Fixed webp size check in ' + file);
  } else {
    console.log('Target not found or already fixed in ' + file);
  }
});
