const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    gpa: { type: String },
    description: { type: String }
}, { _id: false });

const experienceSchema = new mongoose.Schema({
    company: { type: String, required: true },
    jobTitle: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    current: { type: Boolean, default: false },
    location: { type: String },
    description: { type: String }
}, { _id: false });

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String },
    description: { type: String },
    technologies: [{ type: String }],
    githubLink: { type: String },
    liveLink: { type: String },
    startDate: { type: String },
    endDate: { type: String }
}, { _id: false });

const resumeSchema = new mongoose.Schema({
    // User reference
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },

    // Resume metadata
    title: {
        type: String,
        default: 'My Resume',
        required: true
    },
    template: {
        type: String,
        enum: ['classic', 'modern', 'minimal', 'minimal-image'],
        default: 'modern'
    },
    accentColor: {
        type: String,
        default: '#2563eb',
        validate: {
            validator: function (v) {
                return /^#[0-9A-F]{6}$/i.test(v);
            },
            message: props => `${props.value} is not a valid hex color!`
        }
    },
    isPublic: {
        type: Boolean,
        default: false
    },

    // Personal Information
    personalInfo: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String },
        location: { type: String },
        profession: { type: String },
        linkedIn: { type: String },
        website: { type: String },
        profileImage: { type: String }
    },

    // Professional Summary
    summary: { type: String },

    // Education
    education: [educationSchema],

    // Experience
    experience: [experienceSchema],

    // Projects
    projects: [projectSchema],

    // Skills
    skills: [{ type: String }],

    // Achievements
    achievements: [{ type: String }],

    // Custom sections (for future extensibility)
    customSections: [{
        title: { type: String },
        content: { type: String }
    }],

    // Metadata
    version: { type: Number, default: 1 },
    lastModified: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Update lastModified before saving
resumeSchema.pre('save', function (next) {
    this.lastModified = Date.now();
    next();
});

// Index for faster queries
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
