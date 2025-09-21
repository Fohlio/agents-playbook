// Simple test to verify extension structure
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Agents Playbook Extension Structure...\n');

// Test file structure
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'README.md',
  'src/extension.ts',
  'src/types.ts',
  'src/orchestrator/orchestrator-agent.ts',
  'src/agents/sub-agent-base.ts',
  'src/agents/sub-agent-factory.ts',
  'src/context/context-isolation-manager.ts',
  'src/ui/workflow-progress-provider.ts',
  'src/ui/agent-status-provider.ts',
  'src/ui/validation-interface.ts',
  'src/workflow/workflow-loader.ts',
  'src/workflow/workflow-parser.ts',
  'src/tasks/tasks-markdown-manager.ts',
  'out/extension.js'
];

console.log('📁 Checking file structure:');
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
}

// Test package.json structure
console.log('\n📦 Checking package.json:');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log(`  ✅ Name: ${pkg.name}`);
  console.log(`  ✅ Version: ${pkg.version}`);
  console.log(`  ✅ Main: ${pkg.main}`);
  console.log(`  ✅ Commands: ${pkg.contributes?.commands?.length || 0}`);
  console.log(`  ✅ Views: ${Object.keys(pkg.contributes?.views || {}).length}`);
} catch (error) {
  console.log(`  ❌ Failed to parse package.json: ${error.message}`);
}

// Test compiled output
console.log('\n🔨 Checking compilation:');
const outExists = fs.existsSync(path.join(__dirname, 'out'));
if (outExists) {
  const outFiles = fs.readdirSync(path.join(__dirname, 'out'), { recursive: true });
  console.log(`  ✅ Compiled files: ${outFiles.length}`);
  console.log(`  ✅ Main entry: ${fs.existsSync(path.join(__dirname, 'out/extension.js'))}`);
} else {
  console.log(`  ❌ No compiled output found`);
}

console.log('\n🚀 Extension structure test complete!');
console.log('\nNext steps:');
console.log('1. Open this extension in Cursor');
console.log('2. Press F5 to launch Extension Development Host');
console.log('3. Test commands: "Agents Playbook: Start Workflow"');
console.log('4. Verify UI components in Explorer sidebar');