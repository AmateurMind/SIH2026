const mongoose = require('mongoose');
require('dotenv').config();

const Student = require('./models/Student');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_buddy', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(async () => {
        console.log('Connected to MongoDB');

        try {
            const students = await Student.find().select('_id id name email');
            console.log(`Found ${students.length} students:`);
            students.forEach(s => {
                console.log(`  - ${s.name} (email: ${s.email}, id: ${s.id || 'MISSING'}, _id: ${s._id})`);
            });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('Connection error:', err));
