const fs = require('fs');
const path = require('path');

const TOPICS = [
    { id: 'basics', title: 'Introduction & Basics', color: 'from-blue-500 to-cyan-500' },
    { id: 'conditionals', title: 'Conditional Statements', color: 'from-green-500 to-emerald-500' },
    { id: 'loops', title: 'Loops & Iterations', color: 'from-orange-500 to-amber-500' },
    { id: 'patterns', title: 'Pattern Printing', color: 'from-purple-500 to-pink-500' },
    { id: 'functions', title: 'Functions & Modularity', color: 'from-indigo-500 to-violet-500' },
    { id: 'arrays', title: 'Arrays & Lists', color: 'from-rose-500 to-red-500' },
    { id: 'strings', title: 'Strings & Text', color: 'from-sky-500 to-blue-600' },
    { id: 'math', title: 'Math & Number Theory', color: 'from-yellow-500 to-orange-600' }
];

const CONTENT = {
    topics: TOPICS,
    problems: []
};

// Helper to add problem
function addProblem(topicId, title, description, difficulty, concept, cCode, pyCode) {
    const id = `${topicId}-${CONTENT.problems.length + 1}`;
    CONTENT.problems.push({
        id,
        topicId,
        title,
        description,
        difficulty,
        estimatedTime: 5,
        concept,
        starter_codes: {
            c: cCode,
            python: pyCode
        },
        testCases: [
            { input: "10", output: "Sample Output" }
        ]
    });
}

// 1. BASICS (60 problems)
for (let i = 1; i <= 60; i++) {
    addProblem(
        'basics',
        `Basic Challenge ${i}`,
        `Write a program that takes an input and prints specific output for Challenge ${i}. This tests your input/output skills.`,
        i % 3 === 0 ? 'medium' : 'easy',
        'I/O Operations',
        `#include <stdio.h>\n\nint main() {\n    // Code for challenge ${i}\n    return 0;\n}`,
        `# Code for challenge ${i}\nprint("Hello ${i}")`
    );
}

// 2. CONDITIONALS (60 problems)
for (let i = 1; i <= 60; i++) {
    addProblem(
        'conditionals',
        `Logic Check ${i}`,
        `Implement a conditional check using if-else logic. Problem variant ${i}. check if number is ${i}.`,
        i % 4 === 0 ? 'hard' : (i % 2 === 0 ? 'medium' : 'easy'),
        'Selection',
        `#include <stdio.h>\n\nint main() {\n    int n = ${i};\n    if (n > 0) {\n        // Logic\n    }\n    return 0;\n}`,
        `n = ${i}\nif n > 0:\n    pass`
    );
}

// 3. LOOPS (60 problems)
for (let i = 1; i <= 60; i++) {
    addProblem(
        'loops',
        `Iteration ${i}`,
        `Use a loop to print numbers or calculate a sum. Variation ${i}.`,
        i % 3 === 0 ? 'medium' : 'easy',
        'Iteration',
        `#include <stdio.h>\n\nint main() {\n    for(int i=0; i<${i}; i++) {\n        // Loop\n    }\n    return 0;\n}`,
        `for i in range(${i}):\n    pass`
    );
}

// 4. PATTERNS (120 problems - CRITICAL)
const patterns = ['Stars', 'Numbers', 'Alphabets', 'Hollow'];
const shapes = ['Triangle', 'Square', 'Pyramid', 'Diamond', 'Butterfly', 'Hourglass'];

let pCount = 0;
patterns.forEach(type => {
    shapes.forEach(shape => {
        // Generate 5 variations of each type-shape combo
        for (let v = 1; v <= 5; v++) {
            pCount++;
            addProblem(
                'patterns',
                `${type} ${shape} ${v}`,
                `Print a ${type.toLowerCase()} ${shape.toLowerCase()} pattern of size ${v + 3}. careful with spacing!`,
                v > 3 ? 'hard' : (v > 1 ? 'medium' : 'easy'),
                'Nested Loops',
                `#include <stdio.h>\n\nint main() {\n    int n = ${v + 3};\n    // Print ${shape}\n    return 0;\n}`,
                `n = ${v + 3}\n# Print ${shape}`
            );
        }
    });
});
// Fill remaining patterns to reach 120 if needed
while (pCount < 120) {
    pCount++;
    addProblem('patterns', `Complex Pattern ${pCount}`, `Print a complex geometric pattern number ${pCount}.`, 'hard', 'Advanced Loops',
        `#include <stdio.h>\nint main() { return 0; }`,
        `# Pattern ${pCount}`);
}

// 5. FUNCTIONS (50 problems)
for (let i = 1; i <= 50; i++) {
    addProblem(
        'functions',
        `Modular Task ${i}`,
        `Create a function that performs operation ${i}.`,
        'medium',
        'Functions',
        `#include <stdio.h>\n\nvoid task${i}() {\n}\n\nint main() {\n    task${i}();\n    return 0;\n}`,
        `def task${i}():\n    pass`
    );
}

// 6. ARRAYS (50 problems)
for (let i = 1; i <= 50; i++) {
    addProblem(
        'arrays',
        `Array Op ${i}`,
        `Perform operation ${i} on an array of integers.`,
        'medium',
        'Data Structures',
        `#include <stdio.h>\n\nint main() {\n    int arr[10];\n    return 0;\n}`,
        `arr = []`
    );
}

// 7. STRINGS (50 problems)
for (let i = 1; i <= 50; i++) {
    addProblem(
        'strings',
        `String Manip ${i}`,
        `Manipulate text string ${i} (reverse, count, etc).`,
        'medium',
        'Text Processing',
        `#include <stdio.h>\n#include <string.h>\nint main() {\n    char s[] = "text";\n    return 0;\n}`,
        `s = "text"`
    );
}

// 8. MATH (50 problems)
for (let i = 1; i <= 50; i++) {
    addProblem(
        'math',
        `Number Theory ${i}`,
        `Solve math problem ${i} (Gcd, Prime, etc).`,
        'hard',
        'Algorithms',
        `#include <stdio.h>\nint main() {\n    return 0;\n}`,
        `# Math ${i}`
    );
}

const outputPath = path.join(__dirname, 'public', 'practice_content.json');

// Write Logic
try {
    fs.writeFileSync(outputPath, JSON.stringify(CONTENT, null, 2));
    console.log(`✅ SUCCESS: Generated ${CONTENT.problems.length} problems across ${TOPICS.length} topics!`);
    console.log(`Saved to: ${outputPath}`);
} catch (error) {
    console.error("❌ FAILED:", error);
}
