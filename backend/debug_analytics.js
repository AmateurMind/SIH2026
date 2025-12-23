const mongoose = require('mongoose');
require('dotenv').config();
const { Internship, Application } = require('./models');

async function testAggregation() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-placement');

        const totalApps = await Application.countDocuments({});
        console.log('Total Applications in DB:', totalApps);

        // Distribution
        const topCompaniesResult = await Application.aggregate([
            {
                $lookup: {
                    from: 'internships',
                    localField: 'internshipId',
                    foreignField: 'id',
                    as: 'internship'
                }
            },
            {
                $unwind: '$internship'
            },
            {
                $group: {
                    _id: { company: '$internship.company', id: '$internship.id' },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.company',
                    totalApplications: { $sum: '$count' },
                    internshipTracks: { $push: { id: '$_id.id', count: '$count' } }
                }
            },
            {
                $sort: { totalApplications: -1 }
            }
        ]);

        console.log('Detailed Stats:', JSON.stringify(topCompaniesResult, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

testAggregation();
