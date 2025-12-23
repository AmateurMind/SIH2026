/**
 * Web3Forms Email Service Test Script
 * Tests the web3forms email service configuration
 */

require('dotenv').config();
const { sendEmail, notifyApplicationStatusChange } = require('./utils/notify');

async function testWeb3Forms() {
  console.log('🧪 Testing Web3Forms Email Service...\n');
  console.log('='.repeat(50));

  // Test 1: Check if WEB3FORMS_KEY is set
  console.log('\n📋 Test 1: Environment Variable Check');
  if (process.env.WEB3FORMS_KEY) {
    const maskedKey = process.env.WEB3FORMS_KEY.substring(0, 8) + '...' + process.env.WEB3FORMS_KEY.substring(process.env.WEB3FORMS_KEY.length - 4);
    console.log('✅ WEB3FORMS_KEY is set');
    console.log(`   Key: ${maskedKey}`);
  } else {
    console.log('❌ WEB3FORMS_KEY is NOT set');
    console.log('   Please add WEB3FORMS_KEY to your .env file');
    console.log('   Get your key from: https://web3forms.com/');
    process.exit(1);
  }

  // Test 2: Test basic email send
  console.log('\n📋 Test 2: Basic Email Send Test');
  try {
    const testResult = await sendEmail({
      to: 'test@example.com', // This will be sent to your configured email in web3forms
      subject: 'Test Email from Campus Placement Portal',
      message: 'This is a test email to verify Web3Forms integration is working correctly.',
      fromName: 'Campus Placement Portal Test'
    });

    if (testResult.ok) {
      console.log('✅ Email sent successfully!');
      console.log('   Response:', JSON.stringify(testResult.data, null, 2));
    } else if (testResult.skipped) {
      console.log('⚠️  Email send skipped:', testResult.reason);
    } else {
      console.log('❌ Email send failed');
      console.log('   Error:', JSON.stringify(testResult, null, 2));
    }
  } catch (error) {
    console.log('❌ Email test failed with error:', error.message);
  }

  // Test 3: Test notification function
  console.log('\n📋 Test 3: Application Status Notification Test');
  try {
    const notificationResult = await notifyApplicationStatusChange({
      student: {
        name: 'Test Student',
        email: 'test@example.com'
      },
      internship: {
        title: 'Software Developer Intern',
        company: 'Tech Corp'
      },
      status: 'approved',
      feedback: 'Congratulations! Your application has been approved.'
    });

    if (notificationResult.ok) {
      console.log('✅ Notification sent successfully!');
    } else if (notificationResult.skipped) {
      console.log('⚠️  Notification skipped:', notificationResult.reason);
    } else {
      console.log('❌ Notification failed');
      console.log('   Error:', JSON.stringify(notificationResult, null, 2));
    }
  } catch (error) {
    console.log('❌ Notification test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Web3Forms test completed!');
  console.log('='.repeat(50));
  console.log('\n💡 Note: Emails will be sent to the email address');
  console.log('   configured in your Web3Forms account settings.');
  console.log('   Check your Web3Forms dashboard for delivery status.');
}

testWeb3Forms().catch(console.error);

