/**
 * Script to update IPP with sample documents and certificate
 * Run with: node backend/scripts/update_ipp_documents.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { InternshipPerformancePassport } = require('../models');
const connectDB = require('../config/database');

async function updateIPPDocuments() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();
        
        console.log('\nUpdating IPP with documents and certificate...\n');
        
        const ipp = await InternshipPerformancePassport.findOne({ ippId: 'IPP-STU001-INT002-2025' });
        
        if (!ipp) {
            console.log('IPP not found!');
            return;
        }
        
        console.log('Current IPP Status:', ipp.status);
        
        // Add proper document URLs
        if (ipp.studentSubmission) {
            // Update with a valid Google Drive or Dropbox link format
            ipp.studentSubmission.internshipReport = {
                fileUrl: 'https://drive.google.com/file/d/1Example_Internship_Report/view',
                fileName: 'Internship_Report_DataTech_Analytics.pdf',
                uploadedAt: new Date()
            };
            
            // Add sample project documentation
            if (!ipp.studentSubmission.projectDocumentation) {
                ipp.studentSubmission.projectDocumentation = [];
            }
            ipp.studentSubmission.projectDocumentation.push({
                title: 'Data Analysis Dashboard Project',
                description: 'Built interactive dashboard for sales analytics',
                fileUrl: 'https://drive.google.com/file/d/1Example_Project_Docs/view',
                githubLink: 'https://github.com/student/data-dashboard',
                liveDemo: 'https://data-dashboard-demo.netlify.app',
                uploadedAt: new Date()
            });
            
            // Update key learnings (replace 'w' with actual content)
            if (ipp.studentSubmission.studentReflection) {
                ipp.studentSubmission.studentReflection.keyLearnings = [
                    'Mastered Python data analysis libraries (Pandas, NumPy, Matplotlib)',
                    'Learned SQL query optimization for large datasets',
                    'Developed skills in data visualization and storytelling',
                    'Understanding of Agile methodology and sprint planning',
                    'Improved problem-solving and debugging skills'
                ];
                
                ipp.studentSubmission.studentReflection.challenges = [
                    'Working with large datasets (10M+ rows) and performance optimization',
                    'Understanding legacy codebase without proper documentation',
                    'Balancing multiple project deadlines simultaneously'
                ];
                
                ipp.studentSubmission.studentReflection.achievements = [
                    'Reduced report generation time by 60% through query optimization',
                    'Built automated data pipeline saving 20 hours/week of manual work',
                    'Received "Best Intern Project" award from company'
                ];
                
                ipp.studentSubmission.studentReflection.futureGoals = 
                    'I plan to pursue a career in data engineering, focusing on building scalable data pipelines. ' +
                    'This internship has given me hands-on experience with real-world data challenges and ' +
                    'confirmed my passion for working with large-scale data systems.';
            }
            
            console.log('✓ Updated student submission with documents and reflections');
        }
        
        // Generate certificate if not exists
        if (!ipp.certificate || !ipp.certificate.certificateUrl) {
            const certificateId = `CERT-${ipp.ippId}-${Date.now()}`;
            ipp.certificate = {
                certificateId: certificateId,
                certificateUrl: `/api/ipp/certificate/${certificateId}`,
                qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`http://localhost:5173/ipp/view/${ipp.ippId}`)}`,
                generatedAt: new Date(),
                downloadCount: 0
            };
            console.log('✓ Generated certificate details');
        }
        
        // Update status to verified if it was invalid
        if (ipp.status === 'pending_faculty_approval') {
            ipp.status = 'verified';
            console.log('✓ Updated status to verified');
        }
        
        await ipp.save();
        console.log('\n✅ IPP updated successfully!');
        console.log('\nUpdated details:');
        console.log('  - Internship Report: Available');
        console.log('  - Project Documentation: 1 project added');
        console.log('  - Key Learnings: 5 items');
        console.log('  - Challenges: 3 items');
        console.log('  - Achievements: 3 items');
        console.log('  - Certificate: Generated');
        
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
        
    } catch (error) {
        console.error('Error updating IPP:', error);
        process.exit(1);
    }
}

updateIPPDocuments();
