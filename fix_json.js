
const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\DELL\\OneDrive\\Desktop\\gens\\data\\curriculum\\c.json';
let content = fs.readFileSync(filePath, 'utf8');

const key = '"id": "c6"';
const l6Pos = content.indexOf(key);

if (l6Pos === -1) {
    console.error("Could not find Lesson 6");
    process.exit(1);
}

const contentKey = '"content": "';
const startContentPos = content.indexOf(contentKey, l6Pos);
const startValPos = startContentPos + contentKey.length;

// Find the start of the next field to determine the end of the corrupted string
const nextFieldKey = '",\n                "quizQuestions":';
let endValPos = content.indexOf(nextFieldKey, startValPos);

if (endValPos === -1) {
    const backupKey = '","quizQuestions":';
    endValPos = content.indexOf(backupKey, startValPos);
}

if (endValPos === -1) {
    console.error("Could not find end of content field");
    process.exit(1);
}

const newL6Content = `**Welcome to Lesson 6!** In this lesson, we will explore the symbols that perform operations on variables and values: **Operators**.\\n\\n---\\n\\n## Types of Operators in C\\n\\nOperators are grouped based on the type of operation they perform.\\n\\n### Arithmetic Operators\\n\\nUsed to perform mathematical calculations like addition, subtraction, and multiplication.\\n\\n| Operator | Name | Example |\\n| :--- | :--- | :--- |\\n| \`+\` | Addition | \`a + b\` |\\n| \`-\` | Subtraction | \`a - b\` |\\n| \`*\` | Multiplication | \`a * b\` |\\n| \`/\` | Division | \`a / b\` |\\n| \`%\` | Modulo | \`a % b\` |\\n\\n---\\n\\n## Relational Operators\\n\\nUsed to compare two values. They return either \`1\` (true) or \`0\` (false).\\n\\n| Operator | Name | Example |\\n| :--- | :--- | :--- |\\n| \`==\` | Equal to | \`a == b\` |\\n| \`!=\` | Not equal to | \`a != b\` |\\n| \`>\` | Greater than | \`a > b\` |\\n| \`<\` | Less than | \`a < b\` |\\n| \`>=\` | Greater than or equal to | \`a >= b\` |\\n| \`<=\` | Less than or equal to | \`a <= b\` |\\n\\n---\\n\\n## Logical Operators\\n\\nUsed to combine multiple conditions.\\n\\n| Operator | Name | Example |\\n| :--- | :--- | :--- |\\n| \`&&\` | Logical AND | \`a && b\` |\\n| \`||\` | Logical OR | \`a || b\` |\\n| \`!\` | Logical NOT | \`!a\` |\\n\\n---\\n\\n## Assignment Operators\\n\\nUsed to assign values to variables.\\n\\n| Operator | Name | Example |\\n| :--- | :--- | :--- |\\n| \`=\` | Simple Assignment | \`a = 10\` |\\n| \`+=\` | Add and Assign | \`a += 5\` (a = a + 5) |\\n| \`-=\` | Subtract and Assign | \`a -= 5\` (a = a - 5) |\\n\\n---\\n\\n## Increment and Decrement Operators\\n\\nUsed to increase or decrease the value of a variable by \`1\`.\\n\\n| Operator | Name | Example |\\n| :--- | :--- | :--- |\\n| \`++\` | Increment | \`++a\` or \`a++\` |\\n| \`--\` | Decrement | \`--a\` or \`a--\` |\\n\\n---\\n\\n## Your Next Steps\\n\\n1. **Start with:** Decision Making in C\\n2. **Then:** Master \`if\` and \`else\` statements\\n3. **Finally:** Take the Quiz below to test your knowledge!`;

const newContent = content.substring(0, startValPos) + newL6Content + content.substring(endValPos);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully fixed c.json using Node.js");
