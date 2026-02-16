
const fs = require('fs');
const buffer = fs.readFileSync('C:/Users/DELL/OneDrive/Desktop/gens/screens/lessons/LessonView.tsx');
console.log('File size:', buffer.length);
console.log('First 20 bytes:', buffer.slice(0, 20).toString('hex'));
console.log('First 20 chars:', buffer.slice(0, 40).toString('utf16le'));
console.log('UTF-8 text:', buffer.slice(0, 20).toString('utf8'));
