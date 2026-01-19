const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('data/curriculum/python.json', 'utf8'));
  console.log('JSON Valid! Total levels:', data.length);
  data.forEach((level, idx) => {
    console.log(`Level ${idx + 1}: ${level.title}, Lessons: ${level.lessons ? level.lessons.length : 0}`);
  });
} catch(e) {
  console.error('JSON Error:', e.message);
}
