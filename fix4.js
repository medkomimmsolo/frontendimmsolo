const fs = require('fs');

const files = [
  'app/dashboard/lembaga/[id]/page.tsx',
  'app/dashboard/struktural/[id]/page.tsx',
  'app/dashboard/struktural/create/page.tsx'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix urutan: 0);
    content = content.replace(/urutan: 0\);/g, "urutan: 0,\n  });");
    content = content.replace(/urutan: struktural\.urutan \|\| 0\);/g, "urutan: struktural.urutan || 0,\n  });");
    content = content.replace(/logo: lembaga\.logo \|\| null\);/g, "logo: lembaga.logo || null,\n  });");
    
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  } catch (e) {
    console.log('Error on ' + file);
  }
});
