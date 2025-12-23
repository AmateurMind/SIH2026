/**
 * Script to list all IPPs in the database
 * Run with: node backend/scripts/list_ipps.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { InternshipPerformancePassport } = require('../models');
const connectDB = require('../config/database');

async function listAllIPPs() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        
        console.log('\nFetching all IPPs from database...\n');
        
        const ipps = await InternshipPerformancePassport.find({}).sort({ createdAt: -1 });
        
        console.log(`Found ${ipps.length} IPP(s):\n`);
        
        ipps.forEach((ipp, index) => {
            console.log(`${index + 1}. IPP ID: "${ipp.ippId}"`);
            console.log(`   Student ID: ${ipp.studentId}`);
            console.log(`   Internship: ${ipp.internshipDetails?.role} at ${ipp.internshipDetails?.company}`);
            console.log(`   Status: ${ipp.status}`);
            console.log(`   Created: ${ipp.createdAt}`);
            console.log(`   Document URL: ${ipp.studentSubmission?.internshipReport?.fileUrl || 'N/A'}`);
            console.log(`   Certificate URL: ${ipp.studentSubmission?.certificateUrl || ipp.certificate?.certificateUrl || 'N/A'}`);
            console.log('');
        });
        
        await mongoose.connection.close();
        console.log('Database connection closed.');
        
    } catch (error) {
        console.error('Error listing IPPs:', error);
        process.exit(1);
    }
}

listAllIPPs();
