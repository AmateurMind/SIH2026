// Quick Test Script for IPP Magic Link Generation
// Run this in the browser console on http://localhost:5174/admin/ipp-reviews

async function testMagicLinkGeneration() {
    const ippId = 'IPP-STU001-INT002-2025'; // Replace with your actual IPP ID

    try {
        console.log('🔄 Generating magic link for IPP:', ippId);

        const response = await axios.post(`/ipp/${ippId}/send-evaluation-request`, {
            mentorName: 'John Smith',
            mentorEmail: 'john@company.com'
        });

        console.log('✅ Success! Magic link generated:');
        console.log('📎 Link:', response.data.magicLink);
        console.log('');
        console.log('Copy this link and paste it in a new browser tab to test the mentor evaluation form.');

        // Copy to clipboard
        navigator.clipboard.writeText(response.data.magicLink);
        console.log('✅ Link copied to clipboard!');

        return response.data.magicLink;
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.log('');
        console.log('Troubleshooting:');
        console.log('1. Make sure you are logged in as admin');
        console.log('2. Check that the IPP ID exists');
        console.log('3. Verify the backend is running on port 5000');
    }
}

// Run the test
testMagicLinkGeneration();
