const fs = require('fs');

const files = [
  'app/dashboard/events/[id]/page.tsx',
  'app/dashboard/events/create/page.tsx',
  'app/dashboard/lembaga/[id]/page.tsx',
  'app/dashboard/lembaga/create/page.tsx',
  'app/dashboard/struktural/[id]/page.tsx',
  'app/dashboard/struktural/create/page.tsx'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    // Fix trailing comma and broken closing braces
    content = content.replace(/,\s*\n\s*\}\);/g, ');');
    
    // Also let's check for any remaining bad formatting
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  } catch (e) {
    console.log('Error on ' + file);
  }
});
