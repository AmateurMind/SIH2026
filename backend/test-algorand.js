require('dotenv').config();
const { algorandService } = require('./utils/algorandService');

async function test() {
    console.log('=== Algorand Service Test ===');
    console.log('Config:', JSON.stringify(algorandService.isConfigured(), null, 2));
    
    // Test 1: Get transaction params
    console.log('\n--- Test 1: Get TX Params ---');
    const params = await algorandService.getTransactionParams();
    console.log('Params:', JSON.stringify(params, null, 2));
    
    // Test 2: Store a certificate hash
    console.log('\n--- Test 2: Store Certificate Hash ---');
    const testCertData = {
        certificateId: 'CERT-TEST-' + Date.now(),
        ippId: 'IPP-TEST-001',
        studentId: 'test-student',
        studentName: 'Test Student',
        company: 'Test Corp',
        role: 'Intern',
        overallRating: 8.5,
        performanceGrade: 'B+',
        issuedAt: new Date().toISOString()
    };
    
    const result = await algorandService.storeCertificateHash(testCertData, {
        studentName: 'Test Student',
        company: 'Test Corp',
        role: 'Intern'
    });
    
    console.log('Store result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
        // Test 3: Verify the certificate
        console.log('\n--- Test 3: Verify Certificate ---');
        const verifyResult = await algorandService.verifyCertificate(testCertData, result.transactionId);
        console.log('Verify result:', JSON.stringify(verifyResult, null, 2));
    }
}

test().then(() => {
    console.log('\n=== Done ===');
    process.exit(0);
}).catch(err => {
    console.error('FATAL:', err.message);
    console.error(err.stack);
    process.exit(1);
});
