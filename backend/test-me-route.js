const fetch = require('node-fetch');

async function test() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'aarav.sharma@college.edu', password: 'demo123' })
        });
        const loginData = await loginRes.json();
        console.log('Login status:', loginRes.status);
        if (!loginRes.ok) {
            console.log('Login failed:', loginData);
            return;
        }
        const token = loginData.token;
        console.log('Token obtained');

        console.log('--- Testing /me ---');
        const meRes = await fetch('http://localhost:5000/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Me status:', meRes.status);
        if (meRes.status === 404) {
            console.log('Me route 404 Not Found');
        } else {
            const meData = await meRes.json();
            console.log('Me data:', meData);
        }

        console.log('--- Testing /profile ---');
        const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Profile status:', profileRes.status);
        if (profileRes.status === 404) {
            console.log('Profile route 404 Not Found');
        } else {
            const profileData = await profileRes.json();
            console.log('Profile data:', profileData);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

if (typeof fetch === 'undefined') {
    console.log('Global fetch not available');
} else {
    test();
}
