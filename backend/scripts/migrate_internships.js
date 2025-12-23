const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Internship = require('../models/Internship');

const migrateInternships = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const internshipsPath = path.join(__dirname, '../data/internships.json');
        const internshipsData = JSON.parse(fs.readFileSync(internshipsPath, 'utf8'));

        console.log(`Found ${internshipsData.length} internships to migrate`);

        let successCount = 0;
        let errorCount = 0;

        for (const internshipData of internshipsData) {
            try {
                // Ensure required enum fields match or provide defaults
                if (!internshipData.status) internshipData.status = 'active';

                // Upsert to avoid duplicates
                await Internship.findOneAndUpdate(
                    { id: internshipData.id },
                    internshipData,
                    { upsert: true, new: true, runValidators: true }
                );
                successCount++;
                /* console.log(`Migrated internship ${internshipData.id}`); */
            } catch (error) {
                console.error(`Error migrating internship ${internshipData.id}:`, error.message);
                errorCount++;
            }
        }

        console.log(`Migration completed: ${successCount} successful, ${errorCount} failed`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

migrateInternships();
