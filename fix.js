const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('app/dashboard');
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(/,\s*\{\s*headers:\s*\{\s*['"]Content-Type['"]:\s*['"]multipart\/form-data['"]\s*\}?,?\s*\}\s*/g, '');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log('Updated ' + file);
        count++;
    }
});
console.log('Done. Updated ' + count + ' files.');
