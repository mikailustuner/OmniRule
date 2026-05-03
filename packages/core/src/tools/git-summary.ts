import { execSync } from 'child_process';
import { getChangedPaths } from '../lib/changed-files-store.js';
import pc from 'picocolors';

async function main() {
  console.log(pc.bgCyan(pc.black(' OMNIRULE MISSION SUMMARY ')));
  const changes = getChangedPaths();
  if (changes.length === 0) {
    console.log(pc.yellow('No changes detected to summarize.'));
    return;
  }

  console.log(`${pc.blue('i')} Analyzing ${changes.length} changed files...\n`);

  const added = changes.filter((c: any) => c.changeType === 'added').length;
  const modified = changes.filter((c: any) => c.changeType === 'modified').length;
  const deleted = changes.filter((c: any) => c.changeType === 'deleted').length;

  console.log(`${pc.bold('Statistics:')}`);
  console.log(`- Added: ${pc.green(added)}`);
  console.log(`- Modified: ${pc.yellow(modified)}`);
  console.log(`- Deleted: ${pc.red(deleted)}\n`);

  console.log(`${pc.bold('Proposed Commit Message:')}`);
  const type = added > 0 ? 'feat' : modified > 0 ? 'refactor' : 'chore';
  const scope = changes[0].path.split('/')[1] || 'root';
  
  console.log(pc.cyan(`\n${type}(${scope}): update project components and logic`));
  console.log(pc.gray('\n- Modified: ' + changes.slice(0, 5).map((c: any) => c.name).join(', ') + (changes.length > 5 ? '...' : '')));

  try {
    const diff = execSync('git diff --stat', { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    console.log(`\n${pc.bold('Git Stat Info:')}\n${pc.gray(diff)}`);
  } catch (e) {
    console.log(`\n${pc.gray('Note: Git stats unavailable. Working in direct filesystem mode.')}`);
  }
}

main().catch(console.error);
