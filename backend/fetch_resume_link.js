const mongoose = require('mongoose');
const { Student } = require('./models');
const fs = require('fs');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    try {
        const student = await Student.findOne({ name: 'Priya Patel' });
        if (student && student.pdfResumes && student.pdfResumes.length > 0) {
            // Get the latest resume
            const resume = student.pdfResumes[student.pdfResumes.length - 1];
            fs.writeFileSync('resume_url.txt', resume.filePath);
        } else {
            console.log('NO_RESUME_FOUND');
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}).catch(err => {
    console.error(err);
});
