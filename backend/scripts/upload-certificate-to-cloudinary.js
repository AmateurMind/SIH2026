require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const { InternshipPerformancePassport } = require('../models');
const { uploadToCloudinary } = require('../utils/cloudinary');
const connectDB = require('../config/database');

// Certificate to upload
const certificateId = 'CERT-IPP-STU012-INT007-2025';
const ippId = 'IPP-STU012-INT007-2025';
const pdfPath = path.join(__dirname, '../certificates', `${certificateId}.pdf`);

async function uploadAndUpdateCertificate() {
    console.log('🚀 Uploading Certificate to Cloudinary and Updating IPP\n');
    console.log('='.repeat(60));

    try {
        // Connect to MongoDB
        console.log('\n📡 Connecting to MongoDB...');
        await connectDB();
        
        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB connection not ready');
        }
        console.log('✅ Connected to MongoDB');

        // Check if PDF exists
        const fs = require('fs');
        if (!fs.existsSync(pdfPath)) {
            throw new Error(`PDF file not found: ${pdfPath}`);
        }
        console.log(`\n📄 Found PDF: ${certificateId}.pdf`);

        // Upload to Cloudinary
        console.log('\n☁️  Uploading to Cloudinary...');
        const uploadResult = await uploadToCloudinary(pdfPath, {
            folder: 'campus_buddy/certificates',
            resource_type: 'raw', // PDFs should be uploaded as raw files
            public_id: certificateId,
            overwrite: true
        });

        if (!uploadResult.success) {
            throw new Error(`Cloudinary upload failed: ${uploadResult.error}`);
        }

        console.log(`✅ PDF uploaded successfully!`);
        console.log(`   URL: ${uploadResult.url}`);
        console.log(`   Public ID: ${uploadResult.publicId}`);

        // Update IPP document in MongoDB
        console.log(`\n🔄 Updating IPP document: ${ippId}...`);
        const ipp = await InternshipPerformancePassport.findOneAndUpdate(
            { ippId: ippId },
            {
                $set: {
                    'certificate.certificateId': certificateId,
                    'certificate.certificateUrl': uploadResult.url,
                    'certificate.generatedAt': new Date(),
                    updatedAt: new Date()
                }
            },
            { new: true, runValidators: false }
        );

        if (!ipp) {
            throw new Error(`IPP not found: ${ippId}`);
        }

        console.log('✅ IPP document updated successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   IPP ID: ${ippId}`);
        console.log(`   Certificate ID: ${certificateId}`);
        console.log(`   Cloudinary URL: ${uploadResult.url}`);
        console.log(`   Status: ${ipp.status || 'N/A'}`);

        console.log('\n' + '='.repeat(60));
        console.log('✅ Certificate upload and update completed!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n📱 MongoDB connection closed');
        process.exit(0);
    }
}

// Run
if (require.main === module) {
    uploadAndUpdateCertificate();
}

module.exports = { uploadAndUpdateCertificate };

