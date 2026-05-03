import { execSync } from 'child_process';
import pc from 'picocolors';

async function main() {
  console.log(pc.bgGreen(pc.black(' OMNIRULE QUALITY GATE: MASTER VERIFICATION ')));
  console.log(`${pc.blue('i')} Executing all quality checks before mission completion...\n`);

  const checks = [
    { name: 'Security Audit', command: 'npm run tool:security' },
    { name: 'Lint & Format', command: 'npm run tool:lint' },
    { name: 'Test Coverage', command: 'npm run tool:coverage' },
    { name: 'Changed Files', command: 'npm run tool:changed' }
  ];

  let failed = false;

  for (const check of checks) {
    process.stdout.write(`${pc.blue('→')} Running ${pc.bold(check.name)}... `);
    try {
      execSync(check.command, { stdio: 'pipe' });
      console.log(pc.green('PASSED'));
    } catch (e) {
      console.log(pc.red('FAILED'));
      failed = true;
    }
  }

  if (failed) {
    console.log(`\n${pc.red(pc.bold('✖ MISSION REJECTED:'))} Quality gate failures detected. Review logs and fix issues.`);
    process.exit(1);
  } else {
    console.log(`\n${pc.green(pc.bold('✔ MISSION VERIFIED:'))} All quality gates passed. Ready for deployment/merge.`);
  }
}

main().catch(console.error);
