/**
 * IPP API Test Script
 * Tests the basic IPP workflow
 * 
 * Run with: node backend/test_ipp_api.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });
const { InternshipPerformancePassport, Student, Application, Internship } = require('./backend/models');

async function testIPPWorkflow() {
    try {
        console.log('🧪 Testing IPP API Workflow...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        // 1. Find a test student and internship
        const student = await Student.findOne().limit(1);
        const internship = await Internship.findOne().limit(1);
        const application = await Application.findOne({ studentId: student?.id }).limit(1);

        if (!student || !internship || !application) {
            console.log('⚠️  No test data found. Please ensure you have students, internships, and applications in the database.');
            return;
        }

        console.log('📋 Test Data:');
        console.log(`   Student: ${student.name} (${student.id})`);
        console.log(`   Internship: ${internship.title} at ${internship.company}`);
        console.log(`   Application: ${application.id}\n`);

        // 2. Create IPP
        const ippId = `IPP-${student.id}-${internship.id}-${new Date().getFullYear()}`;

        // Check if IPP already exists
        let ipp = await InternshipPerformancePassport.findOne({ ippId });

        if (!ipp) {
            ipp = new InternshipPerformancePassport({
                ippId,
                studentId: student.id,
                internshipId: internship.id,
                applicationId: application.id,
                internshipDetails: {
                    company: internship.company,
                    role: internship.title,
                    domain: internship.eligibleDepartments?.[0] || 'General',
                    startDate: new Date('2025-01-15'),
                    endDate: new Date('2025-04-15'),
                    duration: internship.duration,
                    location: internship.location,
                    workMode: internship.workMode
                },
                status: 'draft'
            });

            await ipp.save();
            console.log('✅ Created IPP:', ippId);
        } else {
            console.log('ℹ️  IPP already exists:', ippId);
        }

        // 3. Test Company Mentor Evaluation
        ipp.companyMentorEvaluation = {
            mentorName: 'John Smith',
            mentorEmail: 'john.smith@company.com',
            mentorDesignation: 'Senior Developer',
            technicalSkills: {
                domainKnowledge: 8,
                problemSolving: 9,
                codeQuality: 8,
                learningAgility: 9,
                toolProficiency: 7
            },
            softSkills: {
                punctuality: 9,
                teamwork: 8,
                communication: 9,
                leadership: 7,
                adaptability: 8,
                workEthic: 9
            },
            overallPerformance: 'Excellent',
            strengths: ['Quick learner', 'Great problem solver', 'Excellent communication'],
            areasForImprovement: ['Could improve on code documentation'],
            keyAchievements: ['Completed 3 major features', 'Optimized database queries'],
            wouldRehire: true,
            recommendationLevel: 'Highly Recommended',
            detailedFeedback: 'Outstanding intern who exceeded expectations in all areas.',
            submittedAt: new Date()
        };

        ipp.verification.companyVerified = true;
        ipp.verification.companyVerifiedAt = new Date();
        ipp.status = 'pending_student_submission';

        await ipp.save();
        console.log('✅ Added company mentor evaluation\n');

        // 4. Test Student Submission
        ipp.studentSubmission = {
            studentReflection: {
                keyLearnings: ['Learned React', 'Improved problem solving', 'Better teamwork'],
                challenges: ['Initially struggled with async programming'],
                achievements: ['Built 3 full-stack features', 'Optimized performance'],
                futureGoals: 'Want to become a full-stack developer'
            },
            submittedAt: new Date()
        };

        ipp.status = 'pending_faculty_approval';
        await ipp.save();
        console.log('✅ Added student submission\n');

        // 5. Test Faculty Assessment
        ipp.facultyMentorAssessment = {
            mentorName: 'Dr. Faculty Mentor',
            learningOutcomes: {
                objectivesMet: true,
                skillsAcquired: ['React', 'Node.js', 'MongoDB'],
                industryExposure: 9,
                professionalGrowth: 8
            },
            academicAlignment: {
                relevanceToCurriculum: 9,
                practicalApplicationOfTheory: 8,
                careerReadiness: 9
            },
            facultyRemarks: 'Excellent internship experience with significant learning',
            creditsAwarded: 4,
            grade: 'A',
            approvalStatus: 'approved',
            submittedAt: new Date()
        };

        ipp.verification.facultyApproved = true;
        ipp.verification.facultyApprovedAt = new Date();
        ipp.verification.finalStatus = 'verified';
        ipp.status = 'verified';

        await ipp.save();
        console.log('✅ Added faculty assessment\n');

        // 6. Calculate Summary
        const technicalAvg = Object.values(ipp.companyMentorEvaluation.technicalSkills).reduce((a, b) => a + b, 0) / 5;
        const softAvg = Object.values(ipp.companyMentorEvaluation.softSkills).reduce((a, b) => a + b, 0) / 6;
        const overallRating = ((technicalAvg + softAvg) / 2).toFixed(2);

        ipp.summary = {
            overallRating: parseFloat(overallRating),
            performanceGrade: overallRating >= 9 ? 'A+' : overallRating >= 8 ? 'A' : 'B+',
            skillGrowthScore: 85,
            employabilityScore: parseFloat(overallRating) * 10,
            recommendationStrength: 'Strong'
        };

        ipp.sharing = {
            publicProfileUrl: `/ipp/view/${ippId}`,
            isPublic: true,
            viewCount: 0
        };

        ipp.status = 'published';
        ipp.publishedAt = new Date();

        await ipp.save();
        console.log('✅ Published IPP with summary\n');

        // Display Results
        console.log('🎉 IPP WORKFLOW TEST COMPLETE!\n');
        console.log('📊 Results:');
        console.log(`   IPP ID: ${ipp.ippId}`);
        console.log(`   Status: ${ipp.status}`);
        console.log(`   Overall Rating: ${ipp.summary.overallRating}/10`);
        console.log(`   Performance Grade: ${ipp.summary.performanceGrade}`);
        console.log(`   Employability Score: ${ipp.summary.employabilityScore}/100`);
        console.log(`   Recommendation: ${ipp.summary.recommendationStrength}`);
        console.log(`   Public URL: ${ipp.sharing.publicProfileUrl}`);
        console.log('\n✅ All tests passed!\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
    }
}

// Run the test
testIPPWorkflow();
