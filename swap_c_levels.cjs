
const fs = require('fs');
const filePath = String.raw`C:\Users\DELL\OneDrive\Desktop\gens\data\curriculum\c.json`;

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    // 1. Identify indices for Level 3 and Level 4
    let l3Index = data.findIndex(m => m.id === 'c-l3');
    let l4Index = data.findIndex(m => m.id === 'c-l4');

    if (l3Index === -1 || l4Index === -1) {
        throw new Error('Could not find Level 3 or Level 4 in curriculum.');
    }

    console.log(`Found Level 3 at index ${l3Index} and Level 4 at index ${l4Index}`);

    // 2. Extract and Swap
    const functionsLevel = data[l3Index];
    const arraysLevel = data[l4Index];

    // Swap positions in the array
    data[l3Index] = arraysLevel;
    data[l4Index] = functionsLevel;

    // 3. Update Level Metadata
    // New Level 3 (was Arrays)
    data[l3Index].id = 'c-l3';
    data[l3Index].title = 'LEVEL 3: Arrays';

    // New Level 4 (was Functions)
    data[l4Index].id = 'c-l4';
    data[l4Index].title = 'LEVEL 4: Functions';

    // 4. Re-index Lessons and Problems
    let lessonCounter = 13;

    // Update Lessons for New Level 3 (Arrays)
    data[l3Index].lessons.forEach((lesson) => {
        lesson.id = 'c' + lessonCounter;
        // Update Title Number (assuming format "XX. Title")
        lesson.title = lesson.title.replace(/^\d+\./, lessonCounter + '.');
        lessonCounter++;
    });

    // Update Problems for New Level 3
    if (data[l3Index].problems) {
        data[l3Index].problems.forEach((problem, idx) => {
            problem.id = `c-l3-p${idx + 1}`;
        });
    }

    // Update Lessons for New Level 4 (Functions)
    data[l4Index].lessons.forEach((lesson) => {
        lesson.id = 'c' + lessonCounter;
        // Update Title Number
        lesson.title = lesson.title.replace(/^\d+\./, lessonCounter + '.');
        lessonCounter++;
    });

    // Update Problems for New Level 4
    if (data[l4Index].problems) {
        data[l4Index].problems.forEach((problem, idx) => {
            problem.id = `c-l4-p${idx + 1}`;
        });
    }

    // 5. Final Write
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log("Successfully interchanged Level 3 and Level 4 and re-indexed all lessons.");

} catch (err) {
    console.error("Error during swap:", err.message);
    process.exit(1);
}
