#!/usr/bin/env node

const { setupTestData, cleanupTestData } = require('./setup');
const { spawn } = require('child_process');

async function runTests() {
  console.log('🚀 Starting Campus Placement Portal Test Suite\n');

  try {
    // Setup test data
    console.log('📝 Setting up test data...');
    await setupTestData();

    // Run TestSprite tests
    console.log('🧪 Running TestSprite tests...\n');

    const testsprite = spawn('npx', ['testsprite', 'run'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });

    return new Promise((resolve, reject) => {
      testsprite.on('close', async (code) => {
        console.log(`\n📊 TestSprite exited with code ${code}`);

        // Cleanup test data
        console.log('🧹 Cleaning up test data...');
        await cleanupTestData();

        if (code === 0) {
          console.log('✅ All tests passed!');
          resolve();
        } else {
          console.log('❌ Some tests failed');
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      testsprite.on('error', async (error) => {
        console.error('❌ Test execution failed:', error);
        await cleanupTestData();
        reject(error);
      });
    });

  } catch (error) {
    console.error('❌ Test setup/cleanup failed:', error);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('\n🎉 Test suite completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runTests };