// Create Test IPP Data
// Run this script with: node create_test_ipp.js

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function createTestIPP() {
    try {
        console.log('🔄 Creating test IPP...\n');

        // Step 1: Login as admin to get token
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@college.edu',
            password: 'admin123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Logged in successfully\n');

        // Step 2: Create IPP
        console.log('2. Creating IPP...');
        const ippResponse = await axios.post(
            `${API_URL}/ipp/create`,
            {
                studentId: 'STU001',
                internshipId: 'INT002',
                applicationId: 'APP001'
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        console.log('✅ IPP Created!');
        console.log('📋 IPP ID:', ippResponse.data.ippId);
        console.log('📊 Status:', ippResponse.data.data.status);
        console.log('\n✨ Now you can see this IPP in the SuperAdmin dashboard!');
        console.log('🔗 Go to: http://localhost:5174/admin/ipp-reviews\n');

        return ippResponse.data;

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Make sure backend is running on port 5000');
        console.log('2. Check that you have student STU001 and internship INT002 in database');
        console.log('3. Verify admin credentials (admin@college.edu / admin123)');
    }
}

createTestIPP();
