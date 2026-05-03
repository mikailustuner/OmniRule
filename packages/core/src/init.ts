import { DesignVault } from './index.js';
import pc from 'picocolors';

async function main() {
  console.log(pc.bgCyan(pc.black(' OMNIRULE INITIALIZATION ')));
  
  const vault = new DesignVault('OmniRule');
  await vault.initialize();
  
  console.log(`${pc.blue('i')} Detecting project-level skills...`);
  const skills = await vault.detectProjectSkills();
  
  console.log(`${pc.green('✔')} Active Skills: ${skills.map((s: any) => pc.yellow(s.name)).join(', ')}`);
  
  // Sync context for the project root to load instructions
  await vault.syncCurrentContext('README.md', skills);
  
  console.log(`\n${pc.magenta('➔')} MISSION STARTUP SEQUENCE COMPLETED.`);
  console.log(`${pc.magenta('➔')} MANDATORY NEXT STEP: Create a Blueprint for your task.`);
}

main().catch(console.error);
