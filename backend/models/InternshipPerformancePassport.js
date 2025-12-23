const mongoose = require('mongoose');

// Sub-schema for company mentor evaluation
const companyMentorEvaluationSchema = new mongoose.Schema({
    mentorName: { type: String, required: true },
    mentorEmail: { type: String, required: true },
    mentorDesignation: { type: String },

    // Technical Skills Rating (1-10)
    technicalSkills: {
        domainKnowledge: { type: Number, min: 1, max: 10 },
        problemSolving: { type: Number, min: 1, max: 10 },
        codeQuality: { type: Number, min: 1, max: 10 },
        learningAgility: { type: Number, min: 1, max: 10 },
        toolProficiency: { type: Number, min: 1, max: 10 },
    },

    // Soft Skills Rating (1-10)
    softSkills: {
        punctuality: { type: Number, min: 1, max: 10 },
        teamwork: { type: Number, min: 1, max: 10 },
        communication: { type: Number, min: 1, max: 10 },
        leadership: { type: Number, min: 1, max: 10 },
        adaptability: { type: Number, min: 1, max: 10 },
        workEthic: { type: Number, min: 1, max: 10 },
    },

    // Performance Metrics
    overallPerformance: {
        type: String,
        enum: ['Excellent', 'Good', 'Average', 'Needs Improvement']
    },
    strengths: [{ type: String }],
    areasForImprovement: [{ type: String }],

    // Key Contributions
    keyAchievements: [{ type: String }],
    projectsWorkedOn: [{
        projectName: String,
        description: String,
        technologiesUsed: [String],
        role: String,
        impact: String
    }],

    // Recommendations
    wouldRehire: { type: Boolean },
    recommendationLevel: {
        type: String,
        enum: ['Highly Recommended', 'Recommended', 'Neutral', 'Not Recommended']
    },
    detailedFeedback: { type: String },
    submittedAt: { type: Date }
}, { _id: false });

// Sub-schema for faculty assessment
const facultyMentorAssessmentSchema = new mongoose.Schema({
    mentorId: { type: String },
    mentorName: { type: String },

    learningOutcomes: {
        objectivesMet: { type: Boolean },
        skillsAcquired: [{ type: String }],
        industryExposure: { type: Number, min: 1, max: 10 },
        professionalGrowth: { type: Number, min: 1, max: 10 },
    },

    academicAlignment: {
        relevanceToCurriculum: { type: Number, min: 1, max: 10 },
        practicalApplicationOfTheory: { type: Number, min: 1, max: 10 },
        careerReadiness: { type: Number, min: 1, max: 10 },
    },

    facultyRemarks: { type: String },
    creditsAwarded: { type: Number, default: 0 },
    grade: { type: String },

    approvalStatus: {
        type: String,
        enum: ['approved', 'needs_revision', 'rejected'],
        default: 'approved'
    },
    approvalRemarks: { type: String },
    submittedAt: { type: Date }
}, { _id: false });

// Main IPP Schema
const internshipPerformancePassportSchema = new mongoose.Schema({
    // Unique identifier
    ippId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },

    // References
    studentId: {
        type: String,
        required: true,
        index: true
    },
    internshipId: {
        type: String,
        required: true,
        index: true
    },
    applicationId: {
        type: String,
        required: true
    },

    // Internship Details (Verified)
    internshipDetails: {
        company: { type: String, required: true },
        role: { type: String, required: true },
        domain: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        duration: { type: String }, // e.g., "3 months"
        location: { type: String },
        workMode: {
            type: String,
            enum: ['Remote', 'On-site', 'Hybrid']
        },
    },

    // Verification Status
    verification: {
        companyVerified: { type: Boolean, default: false },
        companyVerifiedBy: { type: String },
        companyVerifiedAt: { type: Date },

        facultyApproved: { type: Boolean, default: false },
        facultyApprovedBy: { type: String },
        facultyApprovedAt: { type: Date },

        placementCellApproved: { type: Boolean, default: false },
        placementCellApprovedBy: { type: String },
        placementCellApprovedAt: { type: Date },

        finalStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        }
    },

    // Company Mentor Evaluation
    companyMentorEvaluation: companyMentorEvaluationSchema,

    // Faculty Mentor Assessment
    facultyMentorAssessment: facultyMentorAssessmentSchema,

    // Student Submission
    studentSubmission: {
        internshipReport: {
            fileUrl: { type: String },
            fileName: { type: String },
            uploadedAt: { type: Date }
        },

        projectDocumentation: [{
            title: String,
            description: String,
            fileUrl: String,
            githubLink: String,
            liveDemo: String,
            uploadedAt: { type: Date, default: Date.now }
        }],

        weeklyReports: [{
            weekNumber: Number,
            startDate: Date,
            endDate: Date,
            tasksCompleted: [String],
            learnings: String,
            challenges: String,
            fileUrl: String,
            submittedAt: { type: Date, default: Date.now }
        }],

        certificateUrl: { type: String },
        offerLetterUrl: { type: String },

        studentReflection: {
            keyLearnings: [{ type: String }],
            challenges: [{ type: String }],
            achievements: [{ type: String }],
            futureGoals: { type: String }
        },

        submittedAt: { type: Date }
    },

    // Skill Assessment (Before vs After)
    skillAssessment: {
        preAssessment: {
            technicalSkills: [{
                skillName: String,
                level: { type: Number, min: 1, max: 10 },
                selfRated: { type: Boolean, default: true }
            }],
            softSkills: [{
                skillName: String,
                level: { type: Number, min: 1, max: 10 }
            }],
            assessedAt: { type: Date }
        },

        postAssessment: {
            technicalSkills: [{
                skillName: String,
                level: { type: Number, min: 1, max: 10 },
                mentorRated: { type: Boolean, default: false }
            }],
            softSkills: [{
                skillName: String,
                level: { type: Number, min: 1, max: 10 }
            }],
            newSkillsAcquired: [{ type: String }],
            assessedAt: { type: Date }
        },

        skillGrowth: [{
            skillName: String,
            beforeLevel: Number,
            afterLevel: Number,
            growthPercentage: Number,
            growthCategory: {
                type: String,
                enum: ['Significant Growth', 'Moderate Growth', 'Minimal Growth', 'No Change', 'Decline']
            }
        }]
    },

    // Badges & Certifications
    badges: [{
        badgeType: {
            type: String,
            enum: [
                'Internship Completion',
                'Outstanding Performance',
                'Technical Excellence',
                'Leadership',
                'Innovation',
                'Team Player',
                'Quick Learner',
                'Problem Solver'
            ]
        },
        badgeName: String,
        badgeIcon: String,
        earnedCriteria: String,
        awardedAt: { type: Date, default: Date.now }
    }],

    competencyTranscript: {
        technicalCompetencies: [{
            competency: String,
            level: {
                type: String,
                enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
            },
            verifiedBy: String
        }],
        softCompetencies: [{
            competency: String,
            level: {
                type: String,
                enum: ['Developing', 'Proficient', 'Advanced', 'Expert']
            },
            verifiedBy: String
        }]
    },

    // Auto-Generated Certificate
    certificate: {
        certificateId: { type: String, unique: true, sparse: true },
        certificateUrl: { type: String },
        qrCode: { type: String },
        generatedAt: { type: Date },
        downloadCount: { type: Number, default: 0 }
    },

    // Shareable Links
    sharing: {
        publicProfileUrl: { type: String, unique: true, sparse: true },
        qrCodeUrl: { type: String },
        isPublic: { type: Boolean, default: false },
        viewCount: { type: Number, default: 0 },
        sharedWith: [{
            sharedTo: String,
            sharedAt: Date,
            viewedAt: Date
        }]
    },

    // Overall Summary (Auto-calculated)
    summary: {
        overallRating: { type: Number, min: 1, max: 10 },
        performanceGrade: {
            type: String,
            enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F']
        },
        skillGrowthScore: { type: Number, min: 0, max: 100 },
        employabilityScore: { type: Number, min: 0, max: 100 },
        recommendationStrength: {
            type: String,
            enum: ['Strong', 'Moderate', 'Weak']
        }
    },

    // Magic link for company mentor (temporary, expires in 7 days)
    mentorAccessToken: { type: String },
    mentorAccessTokenExpiry: { type: Date },

    // Metadata
    status: {
        type: String,
        enum: ['draft', 'pending_mentor_eval', 'pending_student_submission', 'verified', 'published'],
        default: 'draft',
        index: true
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date }
});

// Pre-save middleware to update timestamp
internshipPerformancePassportSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for efficient queries
internshipPerformancePassportSchema.index({ studentId: 1, createdAt: -1 });
internshipPerformancePassportSchema.index({ 'verification.finalStatus': 1 });
internshipPerformancePassportSchema.index({ status: 1, createdAt: -1 });

// Virtual for checking if IPP is complete
internshipPerformancePassportSchema.virtual('isComplete').get(function () {
    return this.companyMentorEvaluation?.submittedAt &&
        this.studentSubmission?.submittedAt &&
        this.facultyMentorAssessment?.submittedAt;
});

module.exports = mongoose.model('InternshipPerformancePassport', internshipPerformancePassportSchema);
