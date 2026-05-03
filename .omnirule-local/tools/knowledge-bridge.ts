import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';

async function main() {
  console.log(pc.bgCyan(pc.black(' OMNIRULE KNOWLEDGE BRIDGE ')));
  const appDataDir = process.env.APP_DATA_DIR || path.join(process.env.HOME || '', '.gemini', 'antigravity');
  const convId = process.env.CONVERSATION_ID;
  const brainPath = path.join(appDataDir, 'brain');

  console.log(`${pc.blue('i')} Connecting to the hive mind (Brain directory: ${pc.gray(brainPath)})...`);

  const query = process.argv.slice(2).join(' ');
  if (!query) {
    console.log(pc.yellow('! No search query provided. Use: npm run tool:knowledge "search term"'));
    return;
  }

  if (!await fs.pathExists(brainPath)) {
    console.log(pc.red('✖ Knowledge base not accessible in this environment.'));
    return;
  }

  const conversations = await fs.readdir(brainPath);
  console.log(`${pc.blue('i')} Searching across ${pc.cyan(conversations.length)} past conversations for: "${pc.bold(query)}"\n`);

  let findings = 0;
  for (const id of conversations) {
    const logPath = path.join(brainPath, id, '.system_generated', 'logs', 'overview.txt');
    if (await fs.pathExists(logPath)) {
      const content = await fs.readFile(logPath, 'utf-8');
      if (content.toLowerCase().includes(query.toLowerCase())) {
        console.log(`${pc.green('✔')} FOUND in conversation: ${pc.yellow(id)}`);
        // Extract a snippet
        const lines = content.split('\n');
        const matchIndex = lines.findIndex(l => l.toLowerCase().includes(query.toLowerCase()));
        const snippet = lines.slice(Math.max(0, matchIndex - 2), matchIndex + 3).join('\n');
        console.log(pc.gray('--- Snippet ---'));
        console.log(snippet);
        console.log(pc.gray('---------------'));
        findings++;
      }
    }
  }

  if (findings === 0) {
    console.log(pc.gray('No past context found for this query.'));
  } else {
    console.log(`\n${pc.green('✔')} Found ${findings} context points to bridge the current session.`);
  }
}

main().catch(console.error);
