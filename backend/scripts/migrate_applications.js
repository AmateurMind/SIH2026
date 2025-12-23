const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Application = require('../models/Application');

const migrateApplications = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const applicationsPath = path.join(__dirname, '../data/applications.json');
        const applicationsData = JSON.parse(fs.readFileSync(applicationsPath, 'utf8'));

        console.log(`Found ${applicationsData.length} applications to migrate`);

        let successCount = 0;
        let errorCount = 0;

        for (const appData of applicationsData) {
            try {
                // Fix for enum 'mode' mismatches ("online" -> "Video Call")
                if (appData.interviewScheduled && appData.interviewScheduled.mode === 'online') {
                    appData.interviewScheduled.mode = 'Video Call';
                }

                // Use upsert to prevent duplicates based on 'id'
                await Application.findOneAndUpdate(
                    { id: appData.id },
                    appData,
                    { upsert: true, new: true, runValidators: true }
                );
                successCount++;
                /* console.log(`Migrated application ${appData.id}`); */
            } catch (error) {
                console.error(`Error migrating application ${appData.id}:`, error.message);
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

migrateApplications();
