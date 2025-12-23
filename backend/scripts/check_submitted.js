const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Internship = require('../models/Internship');

const checkData = async () => {
    try {
        console.log('--- JSON FILE ---');
        const jsonPath = path.join(__dirname, '../data/internships.json');
        if (fs.existsSync(jsonPath)) {
            const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            const submittedJson = jsonData.filter(i => i.status === 'submitted');
            console.log(`JSON File has ${jsonData.length} total, ${submittedJson.length} submitted.`);
            submittedJson.forEach(i => console.log(`[JSON] Submitted: ${i.title} (${i.id})`));
        } else {
            console.log('JSON file not found.');
        }

        console.log('\n--- MONGODB ---');
        await mongoose.connect(process.env.MONGODB_URI);
        const dbTotal = await Internship.countDocuments({});
        const dbSubmitted = await Internship.find({ status: 'submitted' });
        console.log(`MongoDB has ${dbTotal} total, ${dbSubmitted.length} submitted.`);
        dbSubmitted.forEach(i => console.log(`[DB] Submitted: ${i.title} (${i.id})`));

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
