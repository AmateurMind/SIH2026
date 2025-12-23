require('dotenv').config();
const mongoose = require('mongoose');
const { InternshipPerformancePassport } = require('../models');
const connectDB = require('../config/database');

async function verifyCertificate() {
    try {
        await connectDB();
        
        const ipp = await InternshipPerformancePassport.findOne({ 
            ippId: 'IPP-STU012-INT007-2025' 
        }).lean();

        if (!ipp) {
            console.log('❌ IPP not found');
            process.exit(1);
        }

        console.log('📊 IPP Certificate Status:');
        console.log('='.repeat(60));
        console.log(`IPP ID: ${ipp.ippId}`);
        console.log(`Status: ${ipp.status}`);
        console.log('\n📄 Certificate Info:');
        
        if (ipp.certificate) {
            console.log(`   Certificate ID: ${ipp.certificate.certificateId || 'N/A'}`);
            console.log(`   Certificate URL: ${ipp.certificate.certificateUrl || 'N/A'}`);
            console.log(`   Generated At: ${ipp.certificate.generatedAt ? new Date(ipp.certificate.generatedAt).toISOString() : 'N/A'}`);
            
            if (ipp.certificate.certificateUrl) {
                const isCloudinary = ipp.certificate.certificateUrl.includes('cloudinary.com');
                console.log(`   ✅ URL Type: ${isCloudinary ? 'Cloudinary' : 'Local/Other'}`);
                console.log(`   ✅ URL is valid: ${ipp.certificate.certificateUrl.startsWith('http') ? 'Yes (Full URL)' : 'No (Relative path)'}`);
            }
        } else {
            console.log('   ❌ No certificate object found');
        }

        // Also check studentSubmission.certificateUrl (for backward compatibility)
        if (ipp.studentSubmission?.certificateUrl) {
            console.log(`\n📄 Student Submission Certificate URL: ${ipp.studentSubmission.certificateUrl}`);
        }

        console.log('='.repeat(60));
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

verifyCertificate();

