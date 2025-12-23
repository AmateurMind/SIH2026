const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const stateFile = path.join(__dirname, '../data/.json-monitor-state.json');
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

// Load initial state
let initialState = {};
if (fs.existsSync(stateFile)) {
    try {
        const stateData = fs.readFileSync(stateFile, 'utf8');
        initialState = JSON.parse(stateData);
        // Convert date strings back to Date objects for comparison
        Object.keys(initialState).forEach(file => {
            if (initialState[file].modified) {
                initialState[file].modified = new Date(initialState[file].modified);
            }
        });
    } catch (error) {
        console.error('Error loading initial state:', error.message);
        process.exit(1);
    }
} else {
    console.error('❌ Initial state file not found! Run monitor-json-files.js first.');
    process.exit(1);
}

// Current state
console.log('🔍 Checking for JSON File Changes');
console.log('='.repeat(60));
console.log('\n📊 Comparison Results:\n');

let changesDetected = false;
let newFilesCreated = false;
let filesModified = false;

jsonFiles.forEach(file => {
    const initial = initialState[file] || { exists: false };
    const current = getFileStats(file);
    
    // Check if file was created
    if (!initial.exists && current.exists) {
        console.log(`🆕 NEW FILE CREATED: ${file}`);
        console.log(`   Size: ${current.size} bytes`);
        console.log(`   Created: ${current.created.toISOString()}`);
        console.log('');
        newFilesCreated = true;
        changesDetected = true;
        return;
    }
    
    // Check if file was deleted
    if (initial.exists && !current.exists) {
        console.log(`🗑️  FILE DELETED: ${file}`);
        console.log('');
        changesDetected = true;
        return;
    }
    
    // Check if file was modified
    if (initial.exists && current.exists) {
        const sizeChanged = initial.size !== current.size;
        const timeChanged = initial.modified.getTime() !== current.modified.getTime();
        
        if (sizeChanged || timeChanged) {
            console.log(`✏️  FILE MODIFIED: ${file}`);
            if (sizeChanged) {
                const diff = current.size - initial.size;
                console.log(`   Size: ${initial.size} → ${current.size} bytes (${diff > 0 ? '+' : ''}${diff})`);
            }
            if (timeChanged) {
                console.log(`   Modified: ${initial.modified.toISOString()} → ${current.modified.toISOString()}`);
            }
            console.log('');
            filesModified = true;
            changesDetected = true;
            return;
        }
    }
    
    // No changes
    if (current.exists) {
        console.log(`✅ ${file} - No changes`);
    }
});

console.log('='.repeat(60));

// Summary
if (!changesDetected) {
    console.log('\n✅ SUCCESS: No JSON files were created or modified!');
    console.log('   All operations are using MongoDB only.');
} else {
    console.log('\n⚠️  WARNING: JSON files were modified!');
    if (newFilesCreated) {
        console.log('   ❌ New JSON files were created');
    }
    if (filesModified) {
        console.log('   ❌ Existing JSON files were modified');
    }
    console.log('\n   Routes still using JSON files need to be updated to use MongoDB.');
}

console.log('='.repeat(60));

// Clean up state file
if (fs.existsSync(stateFile)) {
    fs.unlinkSync(stateFile);
    console.log('\n🧹 Cleaned up monitor state file');
}

