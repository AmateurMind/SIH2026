const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
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
            // Get all students from MongoDB
            const students = await Student.find();
            console.log(`Found ${students.length} students in MongoDB.`);

            if (students.length === 0) {
                console.log('No students found in MongoDB. Cannot seed resumes.');
                return;
            }

            // Read students.json
            const studentsDataPath = path.join(__dirname, 'data/students.json');
            let studentsJson = [];
            try {
                const fileContent = fs.readFileSync(studentsDataPath, 'utf8');
                studentsJson = JSON.parse(fileContent);
                console.log(`Loaded ${studentsJson.length} students from students.json.`);
            } catch (err) {
                console.error('Error reading students.json:', err.message);
            }

            // Clear existing resumes to ensure clean state with correct data
            await Resume.deleteMany({});
            console.log('Cleared existing resumes.');

            let createdCount = 0;

            for (const student of students) {
                // Find matching student in JSON data (by email)
                const jsonStudent = studentsJson.find(s => s.email === student.email);

                if (!jsonStudent) {
                    console.log(`No JSON data found for ${student.name} (${student.email}). Using default data.`);
                } else {
                    console.log(`Found JSON data for ${student.name}.`);
                }

                // Create resume data using JSON data if available, else fallback to defaults
                const resumeData = {
                    userId: student._id,
                    title: `${student.name}'s Resume`,
                    template: 'modern',
                    accentColor: '#2563eb',
                    isPublic: true,
                    personalInfo: {
                        fullName: student.name,
                        email: student.email,
                        phone: student.phone || (jsonStudent?.phone) || '123-456-7890',
                        location: student.address || (jsonStudent?.address) || 'New York, NY',
                        profession: 'Student',
                        linkedIn: `linkedin.com/in/${student.name.replace(/\s+/g, '').toLowerCase()}`,
                        website: `portfolio-${student.name.replace(/\s+/g, '').toLowerCase()}.com`
                    },
                    summary: `Motivated ${student.department} student with a passion for technology and problem-solving. Eager to apply skills in a real-world setting.`,
                    education: [
                        {
                            institution: 'Campus Buddy University',
                            degree: 'Bachelor of Technology',
                            fieldOfStudy: student.department,
                            startDate: '2021-08-01',
                            endDate: '2025-05-30',
                            gpa: student.cgpa ? student.cgpa.toString() : (jsonStudent?.cgpa?.toString() || '8.0'),
                            description: `Currently in Semester ${student.semester || jsonStudent?.semester || 1}`
                        }
                    ],
                    experience: [], // JSON doesn't have experience, leave empty
                    skills: (jsonStudent?.skills) || (student.skills && student.skills.length > 0 ? student.skills : ['JavaScript', 'React']),
                    projects: (jsonStudent?.projects || []).map(p => ({
                        title: p.title,
                        type: 'Project',
                        description: p.description,
                        technologies: p.technologies || [],
                        githubLink: p.githubLink,
                        startDate: '2023-01-01', // Dummy date
                        endDate: '2023-05-01'   // Dummy date
                    })),
                    achievements: jsonStudent?.achievements || []
                };

                await Resume.create(resumeData);

                // Update student document with resumeLink so it shows up in profile
                const resumeLink = `/api/resumes/${student.id}`;
                await Student.findByIdAndUpdate(student._id, { resumeLink });

                console.log(`Created resume and updated link for ${student.name}`);
                createdCount++;
            }

            console.log(`Successfully created ${createdCount} resumes.`);

        } catch (error) {
            console.error('Error seeding resumes:', error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('Connection error:', err));
