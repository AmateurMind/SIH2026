require('dotenv').config();
const https = require('https');

const certificateUrl = 'https://res.cloudinary.com/dftkeoquo/raw/upload/v1765264029/campus_buddy/certificates/CERT-IPP-STU012-INT007-2025.pdf';

console.log('🧪 Verifying Cloudinary PDF Access\n');
console.log('='.repeat(60));
console.log(`URL: ${certificateUrl}\n`);

function testUrlAccess(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: 'HEAD', // Use HEAD to check status without downloading
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            resolve({
                statusCode: res.statusCode,
                contentType: res.headers['content-type'],
                contentLength: res.headers['content-length'],
                accessControl: res.headers['access-control-allow-origin']
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.end();
    });
}

testUrlAccess(certificateUrl)
    .then(result => {
        console.log('📊 Test Results:');
        console.log(`   Status Code: ${result.statusCode}`);
        console.log(`   Content-Type: ${result.contentType || 'Not specified'}`);
        console.log(`   Content-Length: ${result.contentLength || 'Unknown'} bytes`);
        console.log(`   CORS Header: ${result.accessControl || 'Not set'}`);
        console.log('');
        
        if (result.statusCode === 200) {
            console.log('✅ SUCCESS: PDF is publicly accessible!');
            console.log('   The 401 error should be resolved.');
        } else if (result.statusCode === 401) {
            console.log('❌ ERROR: 401 Unauthorized');
            console.log('');
            console.log('🔧 SOLUTION REQUIRED:');
            console.log('   1. Go to: https://cloudinary.com/console');
            console.log('   2. Settings → Security');
            console.log('   3. Enable "Allow delivery of PDF and ZIP files"');
            console.log('   4. Save and wait 1-2 minutes');
            console.log('   5. Run this script again to verify');
        } else if (result.statusCode === 403) {
            console.log('❌ ERROR: 403 Forbidden');
            console.log('   PDF delivery is disabled in Cloudinary settings');
        } else {
            console.log(`⚠️  Unexpected status: ${result.statusCode}`);
        }
        
        console.log('\n' + '='.repeat(60));
    })
    .catch(error => {
        console.error('❌ Error testing URL:', error.message);
        console.log('\n💡 Make sure you have internet connection');
    });

