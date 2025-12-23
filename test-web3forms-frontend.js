/**
 * Manual Web3Forms Frontend Test Script
 * Tests the Web3Forms email notification functionality
 * 
 * Usage: 
 * 1. Ensure frontend is running on http://localhost:3000
 * 2. Ensure backend is running on http://localhost:5000
 * 3. Run: node test-web3forms-frontend.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let adminToken = null;
let studentEmail = null;
let applicationId = null;

async function testWeb3Forms() {
  console.log('🧪 Testing Web3Forms Email Notification System\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Login as Admin
    console.log('\n📋 Step 1: Login as Admin');
    const adminLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'sunita.mehta@college.edu',
      password: 'demo123'
    });
    adminToken = adminLoginResponse.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Get applications
    console.log('\n📋 Step 2: Fetch Applications');
    const appsResponse = await axios.get(`${BASE_URL}/api/applications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const applications = appsResponse.data.applications || [];
    console.log(`✅ Found ${applications.length} applications`);

    if (applications.length === 0) {
      console.log('⚠️  No applications found. Please create an application first.');
      return;
    }

    // Get first application with student info
    const application = applications.find(app => app.student?.email) || applications[0];
    applicationId = application.id;
    studentEmail = application.student?.email;

    console.log(`\n📋 Step 3: Testing Email Notification`);
    console.log(`   Application ID: ${applicationId}`);
    console.log(`   Student Email: ${studentEmail || 'N/A'}`);

    if (!studentEmail) {
      console.log('⚠️  No student email found in application. Skipping email test.');
      return;
    }

    // Step 3: Update application status (this should trigger Web3Forms email)
    console.log('\n📋 Step 4: Update Application Status to "approved"');
    console.log('   Note: This should trigger Web3Forms email from frontend');
    
    const updateResponse = await axios.put(
      `${BASE_URL}/api/applications/${applicationId}/status`,
      { 
        status: 'approved',
        feedback: 'Test feedback: Your application has been approved!'
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );

    console.log('✅ Status update successful');
    console.log('   Response includes:', {
      student: updateResponse.data.student ? 'Yes' : 'No',
      internship: updateResponse.data.internship ? 'Yes' : 'No',
      application: updateResponse.data.application ? 'Yes' : 'No'
    });

    // Step 4: Instructions for manual verification
    console.log('\n' + '='.repeat(60));
    console.log('📧 Web3Forms Email Verification');
    console.log('='.repeat(60));
    console.log('\n✅ Backend API call successful!');
    console.log('\n📝 To verify Web3Forms email functionality:');
    console.log('   1. Open your browser console (F12)');
    console.log('   2. Go to http://localhost:3000');
    console.log('   3. Login as admin');
    console.log('   4. Update an application status in the Admin Dashboard');
    console.log('   5. Check browser console for [web3forms] logs');
    console.log('   6. Look for: "[web3forms] Email sent successfully to <email>"');
    console.log('\n💡 Alternative: Check Web3Forms Dashboard');
    console.log('   Visit: https://web3forms.com/dashboard');
    console.log('   Look for email delivery status');
    console.log('\n📧 Expected Email Details:');
    console.log(`   To: ${studentEmail}`);
    console.log(`   Subject: Application approved - ${application.internship?.title || 'Internship'}`);
    console.log('   Template: Table format');

    // Step 5: Test different statuses
    console.log('\n📋 Step 5: Testing Different Status Updates');
    const testStatuses = ['rejected', 'interview_scheduled', 'offered'];
    
    for (const status of testStatuses) {
      try {
        console.log(`\n   Testing status: ${status}`);
        await axios.put(
          `${BASE_URL}/api/applications/${applicationId}/status`,
          { status },
          {
            headers: { Authorization: `Bearer ${adminToken}` }
          }
        );
        console.log(`   ✅ ${status} status update successful`);
      } catch (error) {
        console.log(`   ⚠️  ${status} status update failed: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All backend tests completed!');
    console.log('='.repeat(60));
    console.log('\n📝 Next Steps:');
    console.log('   1. Frontend email sending must be tested in the browser');
    console.log('   2. Check browser console for Web3Forms API calls');
    console.log('   3. Verify email received in student inbox');
    console.log('   4. Check Web3Forms dashboard for delivery status');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run tests
testWeb3Forms().catch(console.error);

