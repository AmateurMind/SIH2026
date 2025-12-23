const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { Student } = require('./models');
const { uploadToCloudinary } = require('./utils/cloudinary');
const connectDB = require('./config/database');
require('dotenv').config();

const migrate = async () => {
    try {
        console.log('🚀 Starting migration to Cloudinary...');
        await connectDB();

        const students = await Student.find({});
        console.log(`Found ${students.length} students to check.`);

        for (const student of students) {
            let updated = false;
            console.log(`\nProcessing student: ${student.name} (${student.id})`);

            // 1. Migrate Profile Picture
            if (student.profilePicture && student.profilePicture.startsWith('/uploads/')) {
                const localPath = path.join(__dirname, student.profilePicture);

                if (fs.existsSync(localPath)) {
                    console.log(`  Found local profile picture: ${localPath}`);
                    const result = await uploadToCloudinary(localPath, {
                        folder: 'campus_buddy/profile_pictures',
                        transformation: [
                            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
                            { quality: 'auto', fetch_format: 'auto' }
                        ]
                    });

                    if (result.success) {
                        console.log(`  ✅ Uploaded profile picture to Cloudinary: ${result.url}`);
                        student.profilePicture = result.url;
                        student.cloudinaryPublicId = result.publicId;
                        updated = true;
                    } else {
                        console.error(`  ❌ Failed to upload profile picture: ${result.error}`);
                    }
                } else {
                    console.warn(`  ⚠️ Local file not found: ${localPath}`);
                }
            }

            // 2. Migrate PDF Resumes
            if (student.pdfResumes && student.pdfResumes.length > 0) {
                for (const resume of student.pdfResumes) {
                    if (resume.filePath && resume.filePath.startsWith('/uploads/')) {
                        const localPath = path.join(__dirname, resume.filePath);

                        if (fs.existsSync(localPath)) {
                            console.log(`  Found local resume: ${localPath}`);
                            const result = await uploadToCloudinary(localPath, {
                                folder: 'campus_buddy/resumes',
                                resource_type: 'raw',
                                public_id: `resume_${student.id}_${Date.now()}`
                            });

                            if (result.success) {
                                console.log(`  ✅ Uploaded resume to Cloudinary: ${result.url}`);
                                resume.filePath = result.url;
                                resume.filename = result.publicId;
                                resume.cloudinaryPublicId = result.publicId;
                                updated = true;
                            } else {
                                console.error(`  ❌ Failed to upload resume: ${result.error}`);
                            }
                        } else {
                            console.warn(`  ⚠️ Local resume file not found: ${localPath}`);
                        }
                    }
                }
            }

            if (updated) {
                await student.save();
                console.log('  💾 Student record updated.');
            } else {
                console.log('  No changes needed.');
            }
        }

        console.log('\n✨ Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
