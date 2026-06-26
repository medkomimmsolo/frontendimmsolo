const fs = require('fs');
const content = fs.readFileSync('app/dashboard/events/[id]/page.tsx', 'utf8');

let open = 0;
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '(') open++;
    if (line[j] === ')') open--;
  }
  if (open < 0 || open > 0) {
    console.log(`Line ${i + 1} (${open}): ${line.trim()}`);
  }
}
console.log('Open parentheses left:', open);
