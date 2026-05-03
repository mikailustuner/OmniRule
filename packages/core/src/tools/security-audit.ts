import { execSync } from 'child_process';
import fs from 'fs-extra';
import { getChangedPaths } from '../lib/changed-files-store.js';
import pc from 'picocolors';

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{48}/, // OpenAI
  /AIza[0-9A-Za-z-_]{35}/, // Google
  /sq0atp-[0-9A-Za-z-_]{22}/, // Square
  /access_token\$production\$[0-9a-z]{16}/, // PayPal
  /[0-9a-f]{32}/, // Generic MD5/Hex secrets
];

async function main() {
  console.log(pc.bgRed(pc.white(' OMNIRULE SECURITY AUDIT ')));
  const changes = getChangedPaths();
  let vulnerabilities = 0;

  console.log(`${pc.blue('i')} Checking ${changes.length} changed files for hardcoded secrets...`);

  for (const file of changes) {
    if (file.changeType === 'deleted') continue;
    
    try {
      const content = await fs.readFile(file.path, 'utf-8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(content)) {
          console.log(`${pc.red('✖')} SECRET DETECTED: ${pc.yellow(file.path)} matches pattern ${pc.gray(pattern.toString())}`);
          vulnerabilities++;
        }
      }
    } catch (e) {}
  }

  console.log(`\n${pc.blue('i')} Running npm audit...`);
  try {
    const audit = execSync('npm audit --json').toString();
    const auditData = JSON.parse(audit);
    const vulns = auditData.metadata.vulnerabilities;
    const total = vulns.info + vulns.low + vulns.moderate + vulns.high + vulns.critical;
    
    if (total > 0) {
      console.log(`${pc.red('✖')} ${total} package vulnerabilities found!`);
      console.log(`- High/Critical: ${pc.red(vulns.high + vulns.critical)}`);
      vulnerabilities += total;
    } else {
      console.log(`${pc.green('✔')} No package vulnerabilities found.`);
    }
  } catch (e) {
    console.log(`${pc.yellow('!')} npm audit check skipped or failed.`);
  }

  if (vulnerabilities === 0) {
    console.log(`\n${pc.green('✔')} Security audit passed.`);
  } else {
    console.log(`\n${pc.red('✖')} Security audit failed with ${vulnerabilities} findings.`);
    process.exit(1);
  }
}

main().catch(console.error);
