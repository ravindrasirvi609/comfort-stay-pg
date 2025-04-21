// Verify PWA files during build process
const fs = require('fs');
const path = require('path');

// Define the files to verify
const filesToVerify = [
  { path: 'public/pwa.js', type: 'script' },
  { path: 'public/sw.js', type: 'script' },
  { path: 'public/sw-register.js', type: 'script' },
  { path: 'public/manifest.json', type: 'json' }
];

console.log('🔍 Verifying PWA files...');

let hasErrors = false;

// Loop through each file and verify it
filesToVerify.forEach(file => {
  try {
    const filePath = path.join(process.cwd(), file.path);
    console.log(`Checking ${file.path}...`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`❌ ERROR: ${file.path} does not exist!`);
      hasErrors = true;
      return;
    }

    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');

    // Verify based on file type
    if (file.type === 'json') {
      try {
        JSON.parse(content);
        console.log(`✅ ${file.path} is valid JSON.`);
      } catch (e) {
        console.error(`❌ ERROR: ${file.path} contains invalid JSON: ${e.message}`);
        hasErrors = true;
      }
    } else if (file.type === 'script') {
      // Basic check for JavaScript files - ensure they don't start with HTML tags
      if (content.trim().startsWith('<!') || content.trim().startsWith('<html')) {
        console.error(`❌ ERROR: ${file.path} appears to be HTML, not JavaScript!`);
        hasErrors = true;
      } else {
        console.log(`✅ ${file.path} appears to be valid JavaScript.`);
      }
    }

  } catch (error) {
    console.error(`❌ ERROR checking ${file.path}: ${error.message}`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('❌ PWA verification failed! Please fix the issues above.');
  process.exit(1);
} else {
  console.log('✅ All PWA files verified successfully!');
} 