import { execSync } from 'child_process';
import pc from 'picocolors';
import { getChangedPaths } from '../lib/changed-files-store.js';

async function main() {
  console.log(pc.bgBlue(pc.white(' OMNIRULE LINT CHECK ')));
  const changes = getChangedPaths().filter((c: any) => c.changeType !== 'deleted' && (c.path.endsWith('.ts') || c.path.endsWith('.tsx') || c.path.endsWith('.js')));
  
  if (changes.length === 0) {
    console.log(pc.gray('No relevant files changed for linting.'));
    return;
  }

  console.log(`${pc.blue('i')} Scanning ${changes.length} changed files...\n`);
  let errors = 0;

  for (const file of changes) {
    try {
      // Attempt to run eslint on the specific file
      console.log(`${pc.blue('→')} Checking ${pc.cyan(file.path)}...`);
      execSync(`npx eslint ${file.path} --max-warnings 0`, { stdio: 'pipe' });
      console.log(`  ${pc.green('✔')} Pass`);
    } catch (e: any) {
      const output = e.stdout?.toString() || e.stderr?.toString() || 'Unknown error';
      console.log(`  ${pc.red('✖')} Lint error in ${pc.yellow(file.path)}`);
      console.log(pc.gray(output.split('\n').slice(0, 5).join('\n')));
      errors++;
    }
  }

  if (errors === 0) {
    console.log(`\n${pc.green('✔')} All changed files passed linting.`);
  } else {
    console.log(`\n${pc.red('✖')} Linting failed for ${errors} files.`);
    process.exit(1);
  }
}

main().catch(console.error);
