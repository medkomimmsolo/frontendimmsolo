const fs = require('fs');
fs.appendFileSync('app/dashboard/events/[id]/page.tsx', '\n}\n');
console.log('Appended brace');
