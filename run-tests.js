import { spawn } from 'child_process';

/**
 * Unified Test Suite Runner
 * Executes both Backend REST API tests and Frontend Functional tests.
 */
console.log('====================================================');
console.log('   🚀 RUNNING FULL-STACK TEST SUITE (API & FUNCTIONAL)');
console.log('====================================================\n');

const runCommand = (command, args, label) => {
  return new Promise((resolve, reject) => {
    console.log(`▶ Running ${label}...`);
    const proc = spawn(command, args, { stdio: 'inherit', shell: true });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`✔ ${label} passed successfully!\n`);
        resolve();
      } else {
        console.error(`✖ ${label} failed with exit code ${code}\n`);
        reject(new Error(`${label} failed`));
      }
    });
  });
};

async function main() {
  const startTime = Date.now();
  try {
    // 1. Backend REST API Tests
    await runCommand('node', ['--test', 'backend/tests/**/*.test.js'], 'Backend REST API Tests');

    // 2. Frontend Functional Tests
    await runCommand('node', ['--test', 'frontend/src/tests/**/*.test.js'], 'Frontend Functional Tests');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('====================================================');
    console.log(`🎉 ALL TESTS PASSED! (Completed in ${duration}s)`);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}

main();
