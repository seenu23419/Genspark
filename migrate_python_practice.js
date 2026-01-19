const fs = require('fs');
const path = require('path');

const pythonDataPath = path.join(__dirname, 'data', 'pythonPracticeProblems.json');
const practiceContentPath = path.join(__dirname, 'public', 'practice_content.json');

const pythonData = JSON.parse(fs.readFileSync(pythonDataPath, 'utf8'));
const practiceContent = JSON.parse(fs.readFileSync(practiceContentPath, 'utf8'));

const pythonTopics = [
    {
        id: 'python-basics',
        title: 'Python Fundamentals',
        problems: pythonData.python_level1_practice.map(p => ({
            ...p,
            concept: 'Fundamentals',
            starter_codes: { python: "# Write your code here\n" },
            test_cases: [{ stdin: "", expected_output: p.expectedOutput }]
        }))
    },
    {
        id: 'python-ds',
        title: 'Data Structures',
        problems: pythonData.python_level2_practice.map(p => ({
            ...p,
            concept: 'Data Structures',
            starter_codes: { python: "# Write your code here\n" },
            test_cases: [{ stdin: "", expected_output: p.expectedOutput }]
        }))
    },
    {
        id: 'python-funcs',
        title: 'Functions & Logic',
        problems: pythonData.python_level3_practice.map(p => ({
            ...p,
            concept: 'Functions',
            starter_codes: { python: "# Write your code here\n" },
            test_cases: [{ stdin: "", expected_output: p.expectedOutput }]
        }))
    },
    {
        id: 'python-oop',
        title: 'Object Oriented',
        problems: pythonData.python_level4_practice.map(p => ({
            ...p,
            concept: 'OOP',
            starter_codes: { python: "# Write your code here\n" },
            test_cases: [{ stdin: "", expected_output: p.expectedOutput }]
        }))
    }
];

practiceContent.languages.python = { topics: pythonTopics };
fs.writeFileSync(practiceContentPath, JSON.stringify(practiceContent, null, 2));

console.log('✓ Python problems merged into practice_content.json');
