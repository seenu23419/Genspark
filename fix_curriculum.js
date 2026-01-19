const fs = require('fs');

const filePath = './data/curriculum/c.json';

function cleanCurriculum() {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        // 1. Fix Level 3 (Functions)
        const level3 = data.find(m => m.id === 'c-l3');
        if (level3) {
            const lessons = level3.lessons;

            // Reconstruct the lessons array to ensure order: Intro, User-Defined, Types, Call by Value, Recursion, Scope
            // We use find to pick the correct ones
            const l13 = lessons.find(l => l.title.includes("Functions in C") && !l.title.includes("User") && !l.title.includes("Types"));
            const l14 = lessons.find(l => l.title.includes("User-Defined Functions"));
            const l15 = lessons.find(l => l.title.includes("Types of Functions"));
            const l16 = lessons.find(l => l.title.includes("Call by Value") && l.duration === "35 mins");
            const l17 = lessons.find(l => l.title.includes("Recursion") && l.duration === "50 mins");
            const l18 = lessons.find(l => l.title.includes("Scope of Variables"));

            if (l13 && l14 && l15 && l16 && l17 && l18) {
                level3.lessons = [l13, l14, l15, l16, l17, l18];
                console.log("Level 3 cleaned successfully.");
            } else {
                console.log("Warning: Could not find all Level 3 lessons.");
            }
        }

        // 2. Global Re-indexing
        let currentIndex = 1;
        data.forEach(module => {
            module.lessons.forEach(lesson => {
                lesson.id = `c${currentIndex}`;
                lesson.title = lesson.title.replace(/^\d+\.\s*/, `${currentIndex}. `);
                currentIndex++;
            });
        });

        fs.writeFileSync(filePath, JSON.stringify(data, null, 4), 'utf8');
        console.log(`Successfully re-indexed ${currentIndex - 1} lessons.`);

    } catch (err) {
        console.log("Error:", err.message);
    }
}

cleanCurriculum();
