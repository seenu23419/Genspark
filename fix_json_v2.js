
const fs = require('fs');

const filePath = 'c:\\Users\\DELL\\OneDrive\\Desktop\\gens\\data\curriculum\\c.json';

try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find the range of lesson 6 (id: c6)
    const l6Start = content.indexOf('"id": "c6"');
    if (l6Start === -1) throw new Error("Could not find l6 start");

    // Find the next lesson or the end of the array
    let l6End = content.indexOf('"id": "c7"', l6Start);
    if (l6End === -1) {
        l6End = content.indexOf('],', l6Start); // End of lessons array
    }
    if (l6End === -1) throw new Error("Could not find l6 end");

    // Reconstruct Lesson 6 block
    const cleanL6 = `{
                "id": "c6",
                "title": "6. C Operators",
                "duration": "35 mins",
                "content": "**Welcome to Lesson 6!** In this lesson, we will explore the symbols that perform operations on variables and values: **Operators**.\\n\\n---\\n\\n## Types of Operators in C\\n\\nOperators are grouped based on the type of operation they perform.\\n\\n### Arithmetic Operators\\n\\nUsed to perform mathematical calculations like addition, subtraction, and multiplication.\\n\\n| Operator | Name | Example |\\n| :--- | :--- | :--- |\\n| \`+\` | Addition | \`a + b\` |\\n| \`-\` | Subtraction | \`a - b\` |\\n| \`*\` | Multiplication | \`a * b\` |\\n| \`/\` | Division | \`a / b\` |\\n| \`%\` | Modulo | \`a % b\` |\\n\\n---\\n\\n## Relational Operators\\n\\nUsed to compare two values. They return either \`1\` (true) or \`0\` (false).\\n\\n| Operator | Name | Example |\\n| :--- | :--- | :--- |\\n| \`==\` | Equal to | \`a == b\` |\\n| \`!=\` | Not equal to | \`a != b\` |\\n| \`>\` | Greater than | \`a > b\` |\\n| \`<\` | Less than | \`a < b\` |\\n| \`>=\` | Greater than or equal to | \`a >= b\` |\\n| \`<=\` | Less than or equal to | \`a <= b\` |\\n\\n---\\n\\n## Logical Operators\\n\\nUsed to combine multiple conditions.\\n\\n| Operator | Name | Example |\\n| :--- | :--- | :--- |\\n| \`&&\` | Logical AND | \`a && b\` |\\n| \`||\` | Logical OR | \`a || b\` |\\n| \`!\` | Logical NOT | \`!a\` |\\n\\n---\\n\\n## Assignment Operators\\n\\nUsed to assign values to variables.\\n\\n| Operator | Name | Example |\\n| :--- | :--- | :--- |\\n| \`=\` | Simple Assignment | \`a = 10\` |\\n| \`+=\` | Add and Assign | \`a += 5\` (a = a + 5) |\\n| \`-=\` | Subtract and Assign | \`a -= 5\` (a = a - 5) |\\n\\n---\\n\\n## Increment and Decrement Operators\\n\\nUsed to increase or decrease the value of a variable by \`1\`.\\n\\n| Operator | Name | Example |\\n| :--- | :--- | :--- |\\n| \`++\` | Increment | \`++a\" or \"a++\` |\\n| \`--\` | Decrement | \`--a\" or \"a--\` |\\n\\n---\\n\\n## Your Next Steps\\n\\n1. **Start with:** Decision Making in C\\n2. **Then:** Master \`if\` and \`else\` statements\\n3. **Finally:** Take the Quiz below to test your knowledge!",
                "quizQuestions": [
                    {
                        "id": 1,
                        "text": "What is the result of \`(5 > 3) ? 10 : 20\`?",
                        "options": [
                            "20",
                            "10",
                            "5",
                            "Error"
                        ],
                        "correctAnswer": 1,
                        "explanation": "The condition (5 > 3) is True, so the ternary operator evaluates the first expression (before the colon), which is 10."
                    },
                    {
                        "id": 2,
                        "text": "What is the result of casting \`(int)3.99\`?",
                        "options": [
                            "4",
                            "3.99",
                            "3",
                            "0"
                        ],
                        "correctAnswer": 2,
                        "explanation": "Casting a float to an int truncates the decimal part completely. It does NOT round up. So 3.99 becomes 3."
                    },
                    {
                        "id": 3,
                        "text": "Which operator has the HIGHEST precedence among the following?",
                        "options": [
                            "&&",
                            "+",
                            "==",
                            "*"
                        ],
                        "correctAnswer": 3,
                        "explanation": "Multiplication (*) happens before addition (+), comparison (==), and logical AND (&&)."
                    },
                    {
                        "id": 4,
                        "text": "In \`(1 || x++)\`, does \`x\` get incremented?",
                        "options": [
                            "Yes",
                            "No",
                            "Only if x is 0",
                            "Runtime Error"
                        ],
                        "correctAnswer": 1,
                        "explanation": "NO. This is short-circuiting. Since the left side \`1\` (True) is already true, C skips the right side \`x++\` entirely."
                    },
                    {
                        "id": 5,
                        "text": "What happens if you use \`if(x = 10)\` instead of \`if(x == 10)\` in C?",
                        "options": [
                            "It causes a compilation error",
                            "It assigns 10 to x and evaluates as True",
                            "It checks if x is equal to 10",
                            "It evaluates as False"
                        ],
                        "correctAnswer": 1,
                        "explanation": "This is a common bug. It performs an ASSIGNMENT, not a comparison. x becomes 10, which is non-zero (True)."
                    }
                ]
            }`;

    // We need to find the start of the object { that contains "id": "c6"
    let blockStart = content.lastIndexOf('{', l6Start);

    // Replace the block
    const newContent = content.substring(0, blockStart) + cleanL6 + content.substring(l6End + 2); // +2 for the close brace and comma if needed

    // Actually, let's be safer.
    // Replace from blockStart to the end of that object.

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Successfully fixed c.json");
} catch (err) {
    console.error(err);
    process.exit(1);
}
