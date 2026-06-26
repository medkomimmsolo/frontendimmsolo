const fs = require('fs');
let content = fs.readFileSync('app/dashboard/events/[id]/page.tsx', 'utf8');
content = content.replace(/\n\}\n$/, '\n');
fs.writeFileSync('app/dashboard/events/[id]/page.tsx', content);
console.log('Fixed extra brace');
