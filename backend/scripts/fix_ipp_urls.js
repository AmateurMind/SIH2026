/**
 * Script to fix the IPP with invalid document URL
 * Run with: node backend/scripts/fix_ipp_urls.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { InternshipPerformancePassport } = require('../models');
const connectDB = require('../config/database');

async function fixIPPUrls() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        
        console.log('\nFixing IPP with invalid URLs...\n');
        
        const ipp = await InternshipPerformancePassport.findOne({ ippId: 'IPP-STU001-INT002-2025' });
        
        if (!ipp) {
            console.log('IPP not found!');
            return;
        }
        
        console.log('Current state:');
        console.log('  Status:', ipp.status);
        console.log('  Document URL:', ipp.studentSubmission?.internshipReport?.fileUrl);
        console.log('  Certificate URL:', ipp.studentSubmission?.certificateUrl);
        
        // Fix invalid status
        if (ipp.status === 'pending_faculty_approval') {
            ipp.status = 'verified'; // Change to valid status
            console.log('\n✓ Fixed invalid status from "pending_faculty_approval" to "verified"');
        }
        
        // Fix invalid URLs
        if (ipp.studentSubmission) {
            // Fix document URL if it's just "w" or invalid
            if (ipp.studentSubmission.internshipReport?.fileUrl === 'w' || 
                (ipp.studentSubmission.internshipReport?.fileUrl && 
                 ipp.studentSubmission.internshipReport.fileUrl.length < 10)) {
                ipp.studentSubmission.internshipReport.fileUrl = '';
                console.log('\n✓ Cleared invalid document URL');
            }
            
            // Fix certificate URL if invalid
            if (ipp.studentSubmission.certificateUrl === 'w' || 
                (ipp.studentSubmission.certificateUrl && 
                 ipp.studentSubmission.certificateUrl.length < 10 &&
                 !ipp.studentSubmission.certificateUrl.startsWith('http'))) {
                ipp.studentSubmission.certificateUrl = '';
                console.log('✓ Cleared invalid certificate URL');
            }
            
            await ipp.save();
            console.log('\n✅ IPP updated successfully!');
        } else {
            console.log('\n⚠️  No student submission found');
        }
        
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
        
    } catch (error) {
        console.error('Error fixing IPP:', error);
        process.exit(1);
    }
}

fixIPPUrls();
