const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Internship = require('../models/Internship');

const checkInternships = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const allInternships = await Internship.find({}, 'id title company').lean();
        console.log('Total Internships in DB:', allInternships.length);
        allInternships.forEach(i => {
            console.log(`- [${i.id}] ${i.title} (${i.company})`);
        });

        const electrical = await Internship.findOne({ title: /ELECTRICAL/i });
        if (electrical) {
            console.log('\nFound ELECTRICAL internship:', electrical);
        } else {
            console.log('\nDid NOT find any internship with title like "ELECTRICAL"');
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkInternships();
