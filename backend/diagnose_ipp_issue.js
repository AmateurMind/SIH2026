const axios = require('axios');
const mongoose = require('mongoose');

// Configuration
const API_URL = 'http://localhost:5000/api';
const MONGODB_URI = process.env.MONGODB_URI; // Use environment variable instead of hardcoded string
const EMAIL = 'suhail17mohammad@gmail.com';
const PASSWORD = '12345678'; // Assuming this is the password based on previous context, or we can skip login for DB check

async function diagnose() {
    console.log('🔍 Starting IPP Diagnosis (Broad Inspection)...');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const Student = mongoose.connection.db.collection('students');
        const Application = mongoose.connection.db.collection('applications');
        const Internship = mongoose.connection.db.collection('internships');

        // 1. Check Student
        console.log(`\n👤 Checking Student: ${EMAIL}`);
        const student = await Student.findOne({ email: EMAIL });
        if (student) {
            console.log(`   Found Student: ${student.name} (ID: ${student.id})`);
        } else {
            console.error('   ❌ Student NOT FOUND in DB!');
            return;
        }

        // 2. Check Applications for this Student
        console.log(`\n📂 Checking Applications for ${student.id}...`);
        const studentApps = await Application.find({ studentId: student.id }).toArray();
        console.log(`   Found ${studentApps.length} applications.`);

        if (studentApps.length === 0) {
            console.warn('   ⚠️ No applications found. This explains why no IPP can be created.');
        }

        for (const app of studentApps) {
            console.log(`   - App ID: ${app.id}, Status: ${app.status}, IPP Status: ${app.ippStatus}`);

            // Check Internship
            const internship = await Internship.findOne({ id: app.internshipId });
            if (internship) {
                console.log(`     Internship: ${internship.title} (ID: ${internship.id})`);
            } else {
                console.error(`     ❌ Internship ${app.internshipId} NOT FOUND!`);
            }
        }

        // 3. Test Server Route Availability (Directly)
        console.log('\n🌐 Testing Server Routes...');
        try {
            await axios.get(`${API_URL}/test-direct`);
            console.log('   ✅ /api/test-direct is working (Server updated)');
        } catch (e) {
            console.log(`   ❌ /api/test-direct failed (${e.response?.status || e.message}) - Server might be stale`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Diagnosis Complete');
    }
}

diagnose();
