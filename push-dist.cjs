
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const distDir = path.join(__dirname, 'dist');
const repoUrl = 'https://github.com/king009-hub/engines.git';

try {
  process.chdir(distDir);
  
  // Initialize git if not already
  if (!fs.existsSync(path.join(distDir, '.git'))) {
    execSync('git init -b main');
    execSync(`git remote add origin ${repoUrl}`);
  }
  
  execSync('git add .');
  try {
    execSync('git commit -m "Production build update - fix CORS and image parsing warnings"');
  } catch (e) {
    console.log('Nothing to commit');
  }
  
  console.log('Pushing to GitHub...');
  execSync('git push -f origin main:main');
  console.log('Successfully pushed to GitHub');
} catch (error) {
  console.error('Error during push:', error.message);
  process.exit(1);
}
