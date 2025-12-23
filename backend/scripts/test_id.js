const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Internship = require('../models/Internship');

const testGenerateId = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Fetch all IDs to show what we have
        const all = await Internship.find({}, 'id');
        console.log('Existing IDs:', all.map(i => i.id));

        // Test the current flawed logic
        const lastInternship = await Internship.findOne().sort({ id: -1 });
        console.log('Last Internship by string sort:', lastInternship ? lastInternship.id : 'None');

        // Propose new logic
        const maxId = all.reduce((max, i) => {
            const match = i.id.match(/INT(\d+)/);
            if (match) {
                const num = parseInt(match[1], 10);
                return num > max ? num : max;
            }
            return max;
        }, 0);

        console.log('Calculated Max ID:', maxId);
        console.log('Next ID:', `INT${String(maxId + 1).padStart(3, '0')}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

testGenerateId();
