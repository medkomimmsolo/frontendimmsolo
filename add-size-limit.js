const fs = require('fs');

const files = [
  'app/dashboard/blog/[id]/page.tsx',
  'app/dashboard/blog/create/page.tsx',
  'app/dashboard/events/create/page.tsx',
  'app/dashboard/lembaga/[id]/page.tsx',
  'app/dashboard/lembaga/create/page.tsx',
  'app/dashboard/struktural/[id]/page.tsx',
  'app/dashboard/struktural/create/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  const targetRegex = /(if\s*\(!file\.type\.startsWith\('image\/'\)\)\s*\{\s*toast\.error\('File harus berupa gambar'\);\s*return;\s*\})/g;
  
  const replacement = `$1\n\n    if (file.size > 2 * 1024 * 1024) {\n      toast.error('Ukuran gambar maksimal 2MB. Silakan pilih gambar yang lebih kecil.');\n      return;\n    }`;
  
  // Only replace if not already replaced
  if (!content.includes('Ukuran gambar maksimal 2MB')) {
    content = content.replace(targetRegex, replacement);
    fs.writeFileSync(file, content);
    console.log('Added 2MB limit to ' + file);
  }
});
