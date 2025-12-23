const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');
const Resume = require('./models/Resume');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_buddy', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            // Count all resumes
            const resumeCount = await Resume.countDocuments();
            console.log(`Total Resumes: ${resumeCount}`);

            // List all resumes
            const resumes = await Resume.find().select('userId title');
            console.log('Resumes:', resumes);

            // List all students
            const students = await Student.find().select('_id name email');
            console.log('Students:', students);

            // Check for matches
            for (const student of students) {
                const count = await Resume.countDocuments({ userId: student._id });
                console.log(`Student ${student.name} (${student._id}) has ${count} resumes.`);
            }

        } catch (error) {
            console.error('Error:', error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('Connection error:', err));
