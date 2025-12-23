const axios = require('axios');

async function checkApi() {
    try {
        const response = await axios.get('http://localhost:5000/api/internships');
        const internships = response.data.internships || response.data;
        console.log(`Found ${internships.length} internships via API.`);

        const electrical = internships.find(i => i.title && i.title.toUpperCase().includes('ELECTRICAL'));
        if (electrical) {
            console.log('Found ELECTRICAL internship via API:', electrical);
        } else {
            console.log('Did NOT find ELECTRICAL internship via API.');
        }

        // Check DB Direct via separate script? I did that in Step 105.
        // Step 105 said "Did NOT find".
        // If API finds it, then API is NOT serving what's in DB (which we know, it serves JSON).
        // If JSON doesn't have it (Step 87), then ???

    } catch (error) {
        console.error('Error fetching from API:', error.message);
    }
}

checkApi();
