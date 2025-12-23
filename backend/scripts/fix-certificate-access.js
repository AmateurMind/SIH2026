require('dotenv').config();
const mongoose = require('mongoose');
const { InternshipPerformancePassport } = require('../models');
const { cloudinary, extractPublicId } = require('../utils/cloudinary');
const connectDB = require('../config/database');

async function fixCertificateAccess() {
    console.log('🔧 Fixing Certificate Access (Making Public)\n');
    console.log('='.repeat(60));

    try {
        await connectDB();

        if (mongoose.connection.readyState !== 1) {
            throw new Error('MongoDB connection not ready');
        }
        console.log('✅ Connected to MongoDB');

        const ippId = 'IPP-STU012-INT007-2025';
        const ipp = await InternshipPerformancePassport.findOne({ ippId }).lean();

        if (!ipp || !ipp.certificate?.certificateUrl) {
            throw new Error('IPP or certificate URL not found');
        }

        const certificateUrl = ipp.certificate.certificateUrl;
        console.log(`\n📄 Current Certificate URL: ${certificateUrl}`);

        // Extract public ID from Cloudinary URL
        // For raw files, the public_id is the path without extension
        let publicId = extractPublicId(certificateUrl);
        if (!publicId) {
            // Fallback: try to extract from URL pattern
            const match = certificateUrl.match(/\/upload\/v\d+\/(.+)\.pdf$/);
            if (match) {
                publicId = match[1];
            } else {
                throw new Error('Could not extract public ID from URL');
            }
        }

        // Remove .pdf extension if present (Cloudinary stores raw files without extension in public_id)
        publicId = publicId.replace(/\.pdf$/, '');

        console.log(`\n🔍 Extracted Public ID: ${publicId}`);

        // Try to update access mode, but if file doesn't exist, re-upload it
        console.log('\n🔓 Setting access mode to public...');
        let updateResult;
        try {
            updateResult = await cloudinary.uploader.explicit(publicId, {
                type: 'upload',
                resource_type: 'raw',
                access_mode: 'public',
                invalidate: true
            });
        } catch (error) {
            if (error.message.includes('not found')) {
                console.log('⚠️  File not found with explicit, trying to re-upload with public access...');
                // Re-upload the file with public access
                const path = require('path');
                const fs = require('fs');
                const pdfPath = path.join(__dirname, '../certificates/CERT-IPP-STU012-INT007-2025.pdf');

                if (!fs.existsSync(pdfPath)) {
                    throw new Error('PDF file not found for re-upload');
                }

                const { uploadToCloudinary } = require('../utils/cloudinary');
                const uploadResult = await uploadToCloudinary(pdfPath, {
                    folder: 'campus_buddy/certificates',
                    resource_type: 'raw',
                    public_id: 'CERT-IPP-STU012-INT007-2025',
                    access_mode: 'public',
                    overwrite: true
                });

                if (!uploadResult.success) {
                    throw new Error(`Re-upload failed: ${uploadResult.error}`);
                }

                updateResult = {
                    secure_url: uploadResult.url,
                    public_id: uploadResult.publicId,
                    access_mode: 'public'
                };
                console.log('✅ File re-uploaded with public access');
            } else {
                throw error;
            }
        }

        console.log('✅ Access mode updated to public');
        console.log(`   Public ID: ${updateResult.public_id}`);
        console.log(`   Secure URL: ${updateResult.secure_url}`);
        console.log(`   Access Mode: ${updateResult.access_mode || 'public'}`);

        // Update MongoDB with the confirmed public URL
        await InternshipPerformancePassport.findOneAndUpdate(
            { ippId },
            {
                $set: {
                    'certificate.certificateUrl': updateResult.secure_url,
                    updatedAt: new Date()
                }
            }
        );

        console.log('\n✅ MongoDB updated with public URL');
        console.log('\n' + '='.repeat(60));
        console.log('✅ Certificate is now publicly accessible!');
        console.log('='.repeat(60));
        console.log(`\n📄 New Public URL: ${updateResult.secure_url}`);
        console.log('\n💡 The PDF should now load without 401 errors.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n📱 MongoDB connection closed');
        process.exit(0);
    }
}

if (require.main === module) {
    fixCertificateAccess();
}

module.exports = { fixCertificateAccess };

