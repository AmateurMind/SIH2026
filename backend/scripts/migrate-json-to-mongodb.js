require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Application, Internship, InternshipPerformancePassport } = require('../models');
const { uploadToCloudinary } = require('../utils/cloudinary');
const connectDB = require('../config/database');

// File paths
const applicationsPath = path.join(__dirname, '../data/applications.json');
const internshipsPath = path.join(__dirname, '../data/internships.json');
const ippsPath = path.join(__dirname, '../data/ipps.json');
const pdfPath = path.join(__dirname, '../certificates/CERT-IPP-STU012-INT009-2025.pdf');

// Helper function to read JSON files
const readJSONFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return null;
    }
};

// Migrate Applications
async function migrateApplications() {
    console.log('\n📋 Migrating Applications...');
    const applications = readJSONFile(applicationsPath);
    if (!applications || !Array.isArray(applications)) {
        console.error('❌ Invalid applications data');
        return { success: false, count: 0 };
    }

    let successCount = 0;
    let errorCount = 0;

    for (const app of applications) {
        try {
            // Check connection before each operation
            if (mongoose.connection.readyState !== 1) {
                throw new Error('MongoDB connection not ready');
            }

            // Convert date strings to Date objects
            const applicationData = {
                ...app,
                appliedAt: app.appliedAt ? new Date(app.appliedAt) : new Date(),
                updatedAt: app.updatedAt ? new Date(app.updatedAt) : new Date(),
                interviewScheduled: app.interviewScheduled ? {
                    ...app.interviewScheduled,
                    date: app.interviewScheduled.date ? new Date(app.interviewScheduled.date) : undefined
                } : undefined,
                offerDetails: app.offerDetails ? {
                    ...app.offerDetails,
                    startDate: app.offerDetails.startDate ? new Date(app.offerDetails.startDate) : undefined,
                    offerExpiry: app.offerDetails.offerExpiry ? new Date(app.offerDetails.offerExpiry) : undefined
                } : undefined,
                rejectedAt: app.rejectedAt ? new Date(app.rejectedAt) : undefined
            };

            // Use upsert to avoid duplicates with explicit connection check
            await Application.findOneAndUpdate(
                { id: app.id },
                applicationData,
                { 
                    upsert: true, 
                    new: true, 
                    setDefaultsOnInsert: true,
                    runValidators: false // Skip validation for faster migration
                }
            );
            successCount++;
            if (successCount % 10 === 0) {
                console.log(`   Progress: ${successCount}/${applications.length} applications migrated...`);
            }
        } catch (error) {
            console.error(`Error migrating application ${app.id}:`, error.message);
            errorCount++;
        }
    }

    console.log(`✅ Applications migrated: ${successCount} success, ${errorCount} errors`);
    return { success: true, count: successCount, errors: errorCount };
}

// Migrate Internships
async function migrateInternships() {
    console.log('\n💼 Migrating Internships...');
    const internships = readJSONFile(internshipsPath);
    if (!internships || !Array.isArray(internships)) {
        console.error('❌ Invalid internships data');
        return { success: false, count: 0 };
    }

    let successCount = 0;
    let errorCount = 0;

    for (const internship of internships) {
        try {
            // Check connection before each operation
            if (mongoose.connection.readyState !== 1) {
                throw new Error('MongoDB connection not ready');
            }

            // Convert date strings to Date objects
            const internshipData = {
                ...internship,
                applicationDeadline: internship.applicationDeadline ? new Date(internship.applicationDeadline) : new Date(),
                startDate: internship.startDate ? new Date(internship.startDate) : new Date(),
                endDate: internship.endDate ? new Date(internship.endDate) : undefined,
                createdAt: internship.createdAt ? new Date(internship.createdAt) : new Date(),
                updatedAt: internship.updatedAt ? new Date(internship.updatedAt) : new Date(),
                submittedAt: internship.submittedAt ? new Date(internship.submittedAt) : undefined,
                approvedAt: internship.approvedAt ? new Date(internship.approvedAt) : undefined
            };

            // Use upsert to avoid duplicates
            await Internship.findOneAndUpdate(
                { id: internship.id },
                internshipData,
                { 
                    upsert: true, 
                    new: true, 
                    setDefaultsOnInsert: true,
                    runValidators: false
                }
            );
            successCount++;
        } catch (error) {
            console.error(`Error migrating internship ${internship.id}:`, error.message);
            errorCount++;
        }
    }

    console.log(`✅ Internships migrated: ${successCount} success, ${errorCount} errors`);
    return { success: true, count: successCount, errors: errorCount };
}

// Migrate IPPs
async function migrateIPPs() {
    console.log('\n📑 Migrating IPPs...');
    const ipps = readJSONFile(ippsPath);
    if (!ipps || !Array.isArray(ipps)) {
        console.error('❌ Invalid IPPs data');
        return { success: false, count: 0 };
    }

    let successCount = 0;
    let errorCount = 0;

    for (const ipp of ipps) {
        try {
            // Check connection before each operation
            if (mongoose.connection.readyState !== 1) {
                throw new Error('MongoDB connection not ready');
            }

            // Convert date strings to Date objects
            const ippData = {
                ...ipp,
                createdAt: ipp.createdAt ? new Date(ipp.createdAt) : new Date(),
                updatedAt: ipp.updatedAt ? new Date(ipp.updatedAt) : new Date(),
                publishedAt: ipp.publishedAt ? new Date(ipp.publishedAt) : undefined,
                mentorAccessTokenExpiry: ipp.mentorAccessTokenExpiry ? new Date(ipp.mentorAccessTokenExpiry) : undefined,
                internshipDetails: ipp.internshipDetails ? {
                    ...ipp.internshipDetails,
                    startDate: ipp.internshipDetails.startDate ? new Date(ipp.internshipDetails.startDate) : undefined,
                    endDate: ipp.internshipDetails.endDate ? new Date(ipp.internshipDetails.endDate) : undefined
                } : undefined,
                companyMentorEvaluation: ipp.companyMentorEvaluation ? {
                    ...ipp.companyMentorEvaluation,
                    submittedAt: ipp.companyMentorEvaluation.submittedAt ? new Date(ipp.companyMentorEvaluation.submittedAt) : undefined
                } : undefined,
                verification: ipp.verification ? {
                    ...ipp.verification,
                    companyVerifiedAt: ipp.verification.companyVerifiedAt ? new Date(ipp.verification.companyVerifiedAt) : undefined,
                    facultyApprovedAt: ipp.verification.facultyApprovedAt ? new Date(ipp.verification.facultyApprovedAt) : undefined,
                    placementCellApprovedAt: ipp.verification.placementCellApprovedAt ? new Date(ipp.verification.placementCellApprovedAt) : undefined
                } : undefined,
                studentSubmission: ipp.studentSubmission ? {
                    ...ipp.studentSubmission,
                    submittedAt: ipp.studentSubmission.submittedAt ? new Date(ipp.studentSubmission.submittedAt) : undefined,
                    internshipReport: ipp.studentSubmission.internshipReport ? {
                        ...ipp.studentSubmission.internshipReport,
                        uploadedAt: ipp.studentSubmission.internshipReport.uploadedAt ? new Date(ipp.studentSubmission.internshipReport.uploadedAt) : undefined
                    } : undefined,
                    projectDocumentation: ipp.studentSubmission.projectDocumentation ? ipp.studentSubmission.projectDocumentation.map(doc => ({
                        ...doc,
                        uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : undefined
                    })) : undefined
                } : undefined,
                certificate: ipp.certificate ? {
                    ...ipp.certificate,
                    generatedAt: ipp.certificate.generatedAt ? new Date(ipp.certificate.generatedAt) : undefined
                } : undefined,
                summary: ipp.summary ? {
                    ...ipp.summary,
                    completedAt: ipp.summary.completedAt ? new Date(ipp.summary.completedAt) : undefined
                } : undefined
            };

            // Handle certificateUrl at root level (for backward compatibility)
            if (ipp.certificateUrl && !ippData.certificate) {
                ippData.certificate = {
                    certificateUrl: ipp.certificateUrl,
                    generatedAt: ipp.certificateGeneratedAt ? new Date(ipp.certificateGeneratedAt) : new Date()
                };
            }

            // Use upsert to avoid duplicates
            await InternshipPerformancePassport.findOneAndUpdate(
                { ippId: ipp.ippId },
                ippData,
                { 
                    upsert: true, 
                    new: true, 
                    setDefaultsOnInsert: true,
                    runValidators: false
                }
            );
            successCount++;
        } catch (error) {
            console.error(`Error migrating IPP ${ipp.ippId}:`, error.message);
            errorCount++;
        }
    }

    console.log(`✅ IPPs migrated: ${successCount} success, ${errorCount} errors`);
    return { success: true, count: successCount, errors: errorCount };
}

// Upload PDF to Cloudinary
async function uploadPDFToCloudinary() {
    console.log('\n📄 Uploading PDF to Cloudinary...');
    
    if (!fs.existsSync(pdfPath)) {
        console.error(`❌ PDF file not found at: ${pdfPath}`);
        return { success: false, url: null };
    }

    try {
        const result = await uploadToCloudinary(pdfPath, {
            folder: 'campus_buddy/certificates',
            resource_type: 'raw', // PDFs should be uploaded as raw files
            public_id: 'CERT-IPP-STU012-INT009-2025',
            overwrite: true
        });

        if (result.success) {
            console.log(`✅ PDF uploaded successfully: ${result.url}`);
            return { success: true, url: result.url, publicId: result.publicId };
        } else {
            console.error(`❌ PDF upload failed: ${result.error}`);
            return { success: false, url: null, error: result.error };
        }
    } catch (error) {
        console.error('❌ Error uploading PDF:', error.message);
        return { success: false, url: null, error: error.message };
    }
}

// Update IPP with Cloudinary certificate URL
async function updateIPPWithCloudinaryURL(cloudinaryUrl) {
    console.log('\n🔄 Updating IPP with Cloudinary certificate URL...');
    
    try {
        const ipp = await InternshipPerformancePassport.findOneAndUpdate(
            { ippId: 'IPP-STU012-INT009-2025' },
            {
                $set: {
                    'certificate.certificateUrl': cloudinaryUrl,
                    'certificate.certificateId': 'CERT-IPP-STU012-INT009-2025',
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (ipp) {
            console.log(`✅ IPP updated with Cloudinary URL`);
            return { success: true };
        } else {
            console.error('❌ IPP not found: IPP-STU012-INT009-2025');
            return { success: false };
        }
    } catch (error) {
        console.error('❌ Error updating IPP:', error.message);
        return { success: false, error: error.message };
    }
}

// Wait for MongoDB connection to be ready
async function waitForConnection(maxWait = 30000) {
    const startTime = Date.now();
    while (mongoose.connection.readyState !== 1) {
        if (Date.now() - startTime > maxWait) {
            throw new Error('MongoDB connection timeout - connection not ready after 30 seconds');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Main migration function
async function runMigration() {
    console.log('🚀 Starting Migration: JSON Files → MongoDB & PDF → Cloudinary\n');
    console.log('='.repeat(60));

    try {
        // Check if MONGODB_URI is set
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables. Please check your .env file.');
        }
        
        console.log('\n📡 Connecting to MongoDB...');
        console.log(`   Connection string: ${process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@')}`);
        
        const conn = await connectDB();
        
        if (!conn) {
            throw new Error('Failed to connect to MongoDB. Please check:\n' +
                '  1. MONGODB_URI in .env file is correct\n' +
                '  2. MongoDB Atlas IP whitelist includes your IP\n' +
                '  3. Network connection is active');
        }
        
        // Wait for connection to be fully ready
        console.log('⏳ Waiting for connection to be ready...');
        await waitForConnection();
        console.log('✅ Connected to MongoDB');
        console.log(`   Host: ${conn.connection.host}`);
        console.log(`   Database: ${conn.connection.name}`);
        console.log(`   Ready State: ${conn.connection.readyState} (1 = connected)`);

        // Migrate data
        const applicationsResult = await migrateApplications();
        const internshipsResult = await migrateInternships();
        const ippsResult = await migrateIPPs();

        // Upload PDF to Cloudinary
        const pdfResult = await uploadPDFToCloudinary();

        // Update IPP with Cloudinary URL if upload was successful
        if (pdfResult.success && pdfResult.url) {
            await updateIPPWithCloudinaryURL(pdfResult.url);
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 Migration Summary:');
        console.log('='.repeat(60));
        console.log(`Applications: ${applicationsResult.count} migrated`);
        console.log(`Internships: ${internshipsResult.count} migrated`);
        console.log(`IPPs: ${ippsResult.count} migrated`);
        console.log(`PDF Upload: ${pdfResult.success ? '✅ Success' : '❌ Failed'}`);
        if (pdfResult.success) {
            console.log(`PDF URL: ${pdfResult.url}`);
        }
        console.log('='.repeat(60));
        console.log('\n✅ Migration completed!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('\n📱 MongoDB connection closed');
        process.exit(0);
    }
}

// Run migration
if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };

