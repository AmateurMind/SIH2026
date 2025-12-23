const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const jsonFiles = [
    'applications.json',
    'internships.json',
    'ipps.json',
    'students.json',
    'mentors.json',
    'recruiters.json',
    'admins.json',
    'feedback.json'
];

// Get file stats
function getFileStats(fileName) {
    const filePath = path.join(dataDir, fileName);
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return {
            exists: true,
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime
        };
    }
    return { exists: false };
}

// Initial state
console.log('📊 JSON Files Monitor');
console.log('='.repeat(60));
console.log('\n📋 Initial State (Before Test):\n');

const initialState = {};
jsonFiles.forEach(file => {
    const stats = getFileStats(file);
    initialState[file] = stats;
    
    if (stats.exists) {
        console.log(`✅ ${file}`);
        console.log(`   Size: ${stats.size} bytes`);
        console.log(`   Last Modified: ${stats.modified.toISOString()}`);
    } else {
        console.log(`❌ ${file} - NOT FOUND`);
    }
    console.log('');
});

// Save initial state to file for comparison
const stateFile = path.join(__dirname, '../data/.json-monitor-state.json');
fs.writeFileSync(stateFile, JSON.stringify(initialState, null, 2), 'utf8');

console.log('='.repeat(60));
console.log('\n✅ Initial state saved!');
console.log('📝 Now run your test process...');
console.log('📝 After testing, run: node scripts/check-json-changes.js');
console.log('='.repeat(60));

