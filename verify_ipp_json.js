const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
const STUDENT_ID = 'STU006';
const APPLICATION_ID = 'APP023';
const INTERNSHIP_ID = 'INT004';

// Mock Auth Token (You might need a real one if auth middleware checks DB/JWT validity strictly)
// Assuming the dev environment allows some way or we can reuse a token if we had login.
// Since I don't have the login logic handy to get a token, I'll try to rely on the fact that I can read the file directly to verify.
// But to hit the API I need a token.
// Let's try to login first.

async function verify() {
    console.log('🚀 Starting IPP JSON Verification...');

    try {
        // 1. Login to get token
        console.log('🔑 Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'suhail17mohammad@gmail.com',
            password: '12345678' // Assuming this is correct from context
        });
        const token = loginRes.data.token;
        console.log('   ✅ Login successful');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Test IPP Route
        console.log('\n🌐 Testing /api/ipp/test...');
        try {
            const testRes = await axios.get(`${API_URL}/ipp/test`);
            console.log('   Response:', testRes.data);
            if (testRes.data.message.includes('JSON Mode')) {
                console.log('   ✅ IPP Route is running in JSON Mode');
            } else {
                console.error('   ❌ IPP Route is NOT in JSON Mode (Old code running?)');
            }
        } catch (e) {
            console.error('   ❌ Test route failed:', e.message);
        }

        // 3. Create IPP
        console.log('\n📝 Creating IPP...');
        try {
            const createRes = await axios.post(`${API_URL}/ipp/create`, {
                studentId: STUDENT_ID,
                internshipId: INTERNSHIP_ID,
                applicationId: APPLICATION_ID
            }, { headers });

            console.log('   ✅ IPP Created:', createRes.data);
        } catch (e) {
            if (e.response && e.response.data && e.response.data.error === 'IPP already exists for this internship') {
                console.log('   ⚠️ IPP already exists (Expected if run multiple times)');
            } else {
                console.error('   ❌ Create IPP Failed:', e.response?.data || e.message);
            }
        }

        // 4. Verify File Content
        console.log('\n📂 Verifying ipps.json...');
        const ippsPath = path.join(__dirname, 'backend/data/ipps.json');
        if (fs.existsSync(ippsPath)) {
            const ipps = JSON.parse(fs.readFileSync(ippsPath, 'utf8'));
            const myIpp = ipps.find(i => i.studentId === STUDENT_ID && i.internshipId === INTERNSHIP_ID);
            if (myIpp) {
                console.log('   ✅ Found IPP in file:', myIpp.ippId);
            } else {
                console.error('   ❌ IPP not found in file!');
            }
        } else {
            console.error('   ❌ ipps.json does not exist!');
        }

    } catch (error) {
        console.error('❌ Verification Error:', error.message);
        if (error.response) console.error('   Details:', error.response.data);
    }
}

verify();
