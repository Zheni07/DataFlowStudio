const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'FINAL_REPORT.md');
let s = fs.readFileSync(file, 'utf8');

// Remove common emoji ranges and specific pictographs
s = s.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '');
// Remove other symbols often used as icons
s = s.replace(/[✅🎉🚀📊✨👉🎯📁📈]/g, '');
// Collapse multiple spaces and remove trailing spaces
s = s.replace(/ +/g, ' ').replace(/ +\n/g, '\n');
// Remove leftover duplicate blank lines (more than 2)
s = s.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(file, s, 'utf8');
console.log('Stripped emojis from', file);
