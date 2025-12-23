const axios = require('axios');

async function testRoutes() {
    const baseURL = 'http://localhost:5000/api';

    console.log('🔍 Testing API Routes...');

    // 1. Test Direct Route (added in server.js)
    try {
        console.log('👉 Testing /api/test-direct...');
        const testRes = await axios.get(`${baseURL}/test-direct`);
        console.log('✅ /api/test-direct is working:', testRes.data);
    } catch (error) {
        console.error('❌ /api/test-direct FAILED:', error.message);
        if (error.response) console.error('   Status:', error.response.status);
    }

    // 2. Test IPP Create Route (checking 404 vs 401)
    // We expect 401 (Unauthorized) if the route exists but requires auth.
    // We expect 404 if the route does not exist.
    try {
        console.log('👉 Testing /api/ipp/create (without auth)...');
        await axios.post(`${baseURL}/ipp/create`, {});
        console.log('❓ /api/ipp/create returned success (unexpected without auth)');
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401) {
                console.log('✅ /api/ipp/create exists and is protected (Received 401 Unauthorized as expected)');
            } else if (error.response.status === 404) {
                console.error('❌ /api/ipp/create returned 404 Not Found - Route is MISSING');
            } else {
                console.log(`⚠️ /api/ipp/create returned status ${error.response.status}`);
            }
        } else {
            console.error('❌ Error connecting to server:', error.message);
        }
    }

    // 3. Test Health Check
    try {
        console.log('👉 Testing /health...');
        const healthRes = await axios.get('http://localhost:5000/health');
        console.log('✅ /health is working:', healthRes.data);
    } catch (error) {
        console.error('❌ /health FAILED:', error.message);
    }
}

testRoutes();
