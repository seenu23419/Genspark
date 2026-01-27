const fs = require('fs');
const path = require('path');

const inputPath = 'c:/Users/DELL/OneDrive/Desktop/gens/public/practice_content.json';
const outputDir = 'c:/Users/DELL/OneDrive/Desktop/gens/public/practice';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

try {
    const dataStr = fs.readFileSync(inputPath, 'utf8');
    const content = JSON.parse(dataStr);
    const { topics, problems } = content;

    // 1. Create topics.json
    fs.writeFileSync(
        path.join(outputDir, 'topics.json'),
        JSON.stringify(topics, null, 2)
    );
    console.log('Created topics.json');

    // 2. Create individual topic files
    topics.forEach(topic => {
        const topicProblems = problems.filter(p => p.topicId === topic.id);
        const topicContent = {
            ...topic,
            problems: topicProblems
        };

        const outPath = path.join(outputDir, `topic_${topic.id}.json`);
        fs.writeFileSync(
            outPath,
            JSON.stringify(topicContent, null, 2)
        );
        console.log(`Created topic_${topic.id}.json with ${topicProblems.length} problems`);
    });

    console.log('Successfully split practice content!');
} catch (err) {
    console.error('Error splitting JSON:', err);
    process.exit(1);
}
