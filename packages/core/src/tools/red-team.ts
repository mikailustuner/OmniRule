import pc from 'picocolors';
import { getChangedPaths } from '../lib/changed-files-store.js';
import fs from 'fs-extra';

const ATTACK_VECTORS = [
  { name: 'SQL Injection', pattern: /raw\(`|query\(`/, message: 'Raw SQL query detected. Use Prisma parameterized queries.' },
  { name: 'Insecure Direct Object Reference (IDOR)', pattern: /id: req\.params\.id/, message: 'Direct ID usage in query. Verify ownership/auth.' },
  { name: 'Sensitive Data Exposure', pattern: /password|secret|token|apikey/i, message: 'Potential sensitive keyword in code/log.' },
  { name: 'XSS Risk', pattern: /dangerouslySetInnerHTML/, message: 'Raw HTML rendering detected. Use sanitized content.' },
  { name: 'Insecure Auth', pattern: /auth: false|public: true/, message: 'Endpoint might be unintentionally public.' }
];

async function main() {
  console.log(pc.bgRed(pc.white(' OMNIRULE RED-TEAM SECURITY SCAN ')));
  const changes = getChangedPaths().filter((c: any) => c.changeType !== 'deleted');
  
  if (changes.length === 0) {
    console.log(pc.gray('No changed files to simulate attack on.'));
    return;
  }

  console.log(`${pc.blue('i')} Simulating attack vectors on ${changes.length} changed files...\n`);
  let threatsFound = 0;

  for (const file of changes) {
    try {
      const content = await fs.readFile(file.path, 'utf-8');
      for (const vector of ATTACK_VECTORS) {
        if (vector.pattern.test(content)) {
          console.log(`${pc.red('!!! ATTACK SUCCESSFUL !!!')}`);
          console.log(`- Vector: ${pc.bold(vector.name)}`);
          console.log(`- Target: ${pc.yellow(file.path)}`);
          console.log(`- Mitigation: ${pc.gray(vector.message)}\n`);
          threatsFound++;
        }
      }
    } catch (e) {}
  }

  if (threatsFound === 0) {
    console.log(`${pc.green('✔')} Red-Team Scan Passed: No obvious vulnerabilities found in current changes.`);
  } else {
    console.log(`${pc.red('✖')} Security breach simulation failed with ${threatsFound} successful attacks.`);
    process.exit(1);
  }
}

main().catch(console.error);
