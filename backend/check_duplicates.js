const fs = require('fs');
const path = require('path');

const applicationsPath = 'c:\\Users\\suhai\\Downloads\\CampusBuddy\\CampusBuddy\\backend\\data\\applications.json';

try {
    const data = fs.readFileSync(applicationsPath, 'utf8');
    const applications = JSON.parse(data);

    const ids = applications.map(app => app.id);
    const uniqueIds = new Set(ids);

    if (ids.length !== uniqueIds.size) {
        console.log('❌ Duplicates found!');
        const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
        console.log('Duplicate IDs:', duplicates);
    } else {
        console.log('✅ No duplicate IDs found. All ' + ids.length + ' IDs are unique.');
    }
} catch (err) {
    console.error('Error reading file:', err);
}
