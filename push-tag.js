const { execSync } = require('child_process');
const { version } = require('./package.json');

const tagName = `v${version}`;

try {
  // Create the tag (in case it's not created yet)
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });

  // Push the tag
  execSync('git push', { stdio: 'inherit' });
  execSync('git push --tags', { stdio: 'inherit' });

  // Release
  execSync(`auto shipit --use-version ${tagName}`, { stdio: 'inherit' });

  console.log(`✅ Pushed tag ${tagName} to origin`);
} catch (err) {
  console.error(`❌ Failed to push tag ${tagName}:`, err.message);
  process.exit(1);
}
