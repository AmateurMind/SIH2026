/**
 * Script to cleanup invalid IPPs from the database
 * Run with: node backend/scripts/cleanup_invalid_ipps.js
 */

require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const { InternshipPerformancePassport } = require('../models');
const connectDB = require('../config/database');

async function cleanupInvalidIPPs() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        
        console.log('Finding invalid IPPs...');
        
        // Find IPPs with invalid ippId format
        // Valid format should be: IPP-{studentId}-{internshipId}-{year}
        const allIPPs = await InternshipPerformancePassport.find({});
        
        const invalidIPPs = allIPPs.filter(ipp => {
            const id = ipp.ippId;
            // Check if ippId is too short or doesn't contain '-'
            return !id || id.length < 10 || !id.includes('-') || !id.startsWith('IPP-');
        });
        
        console.log(`Found ${invalidIPPs.length} invalid IPPs:`);
        
        invalidIPPs.forEach(ipp => {
            console.log(`  - ID: "${ipp.ippId}", StudentID: ${ipp.studentId}, Created: ${ipp.createdAt}`);
        });
        
        if (invalidIPPs.length > 0) {
            console.log('\nDo you want to delete these invalid IPPs? (yes/no)');
            console.log('Run with --delete flag to confirm deletion');
            
            // Check if --delete flag is provided
            if (process.argv.includes('--delete')) {
                console.log('\nDeleting invalid IPPs...');
                
                for (const ipp of invalidIPPs) {
                    await InternshipPerformancePassport.deleteOne({ _id: ipp._id });
                    console.log(`  ✓ Deleted IPP with ID: "${ipp.ippId}"`);
                }
                
                console.log(`\n✅ Deleted ${invalidIPPs.length} invalid IPPs`);
            } else {
                console.log('\n⚠️  No changes made. Run with --delete flag to confirm deletion');
            }
        } else {
            console.log('✅ No invalid IPPs found!');
        }
        
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
        
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}

// Run the cleanup
cleanupInvalidIPPs();
