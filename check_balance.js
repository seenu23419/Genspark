
const fs = require('fs');
const content = fs.readFileSync('C:/Users/DELL/OneDrive/Desktop/gens/screens/lessons/LessonView.tsx', 'utf8');

let braces = 0;
let brackets = 0;
let parens = 0;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') braces++;
    if (char === '}') braces--;
    if (char === '[') brackets++;
    if (char === ']') brackets--;
    if (char === '(') parens++;
    if (char === ')') parens--;
}

console.log(`Braces: ${braces}`);
console.log(`Brackets: ${brackets}`);
console.log(`Parens: ${parens}`);

if (braces !== 0 || brackets !== 0 || parens !== 0) {
    console.log('UNBALANCED!');
} else {
    console.log('BALANCED');
}
