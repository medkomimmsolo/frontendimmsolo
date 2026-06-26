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
    
    // Fix status: 'upcoming'); -> status: 'upcoming',\n  });
    content = content.replace(/status: 'upcoming'\);/g, "status: 'upcoming',\n  });");
    content = content.replace(/status: eventData\.status\);/g, "status: eventData.status,\n  });");
    content = content.replace(/website_url: ''\);/g, "website_url: '',\n  });");
    content = content.replace(/website_url: lembaga\.website_url \|\| ''\);/g, "website_url: lembaga.website_url || '',\n  });");
    content = content.replace(/instagram_url: ''\);/g, "instagram_url: '',\n  });");
    content = content.replace(/instagram_url: data\.instagram_url \|\| ''\);/g, "instagram_url: data.instagram_url || '',\n  });");

    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
  } catch (e) {
    console.log('Error on ' + file);
  }
});
