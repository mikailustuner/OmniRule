import pc from 'picocolors';
import fs from 'fs-extra';
import path from 'path';

async function main() {
  console.log(pc.bgYellow(pc.black(' OMNIRULE INSTINCT STATUS ')));
  const memoryPath = path.join(process.cwd(), '.memory');
  
  if (!await fs.pathExists(memoryPath)) {
    console.log(pc.gray('No memory directory found. No instincts learned yet.'));
    return;
  }

  const files = await fs.readdir(memoryPath);
  const instincts = files.filter(f => f.endsWith('.md') || f.endsWith('.json'));

  console.log(`${pc.blue('i')} Found ${pc.cyan(instincts.length)} learned instincts/memories.\n`);

  for (const instinct of instincts) {
    const stats = await fs.stat(path.join(memoryPath, instinct));
    const lastUpdate = stats.mtime.toLocaleString();
    console.log(`${pc.yellow('★')} ${pc.bold(instinct.padEnd(30))} Updated: ${pc.gray(lastUpdate)}`);
  }

  console.log(`\n${pc.blue('i')} Active Cognitive Context: ${pc.green('HIGHLY OPTIMIZED')}`);
}

main().catch(console.error);
