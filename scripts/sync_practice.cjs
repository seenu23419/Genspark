const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'data', 'practice_content.json');
const targetPath = path.join(__dirname, '..', 'public', 'practice_content.json');

try {
    const rawData = fs.readFileSync(sourcePath, 'utf8');
    const sourceData = JSON.parse(rawData);

    // Extract C topics and problems
    const cData = sourceData.languages.c;

    // Reformat to flat structure if needed, or keep nested structure as handle by service
    // Let's use the nested structure since service supports it
    const output = {
        version: "2.1.0",
        topics: cData.topics
    };

    fs.writeFileSync(targetPath, JSON.stringify(output, null, 2));
    console.log('Successfully updated public/practice_content.json with C programs.');
} catch (error) {
    console.error('Error updating practice content:', error);
}
