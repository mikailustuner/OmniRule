import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { execSync } from 'child_process';

const SEMANTIC_HINTS = {
  'auth': ['jwt', 'session', 'login', 'permission', 'role', 'authorize'],
  'data': ['prisma', 'sql', 'query', 'database', 'repository', 'schema'],
  'ui': ['component', 'react', 'styling', 'tailwind', 'render', 'prop'],
  'error': ['try', 'catch', 'throw', 'error', 'exception', 'handle']
};

async function main() {
  console.log(pc.bgBlue(pc.white(' OMNIRULE SEMANTIC SEARCH ')));
  const query = process.argv[2];
  
  if (!query) {
    console.log(pc.yellow('! Please specify a search term or semantic hint: npm run tool:search <term>'));
    return;
  }

  console.log(`${pc.blue('i')} Performing semantic expansion for: "${pc.bold(query)}"...`);

  // Expand query using semantic hints
  const hints = SEMANTIC_HINTS[query.toLowerCase() as keyof typeof SEMANTIC_HINTS] || [];
  const searchTerms = [query, ...hints];
  
  console.log(`${pc.blue('i')} Expanded Search Terms: ${pc.gray(searchTerms.join(', '))}\n`);

  for (const term of searchTerms) {
    try {
      console.log(`${pc.bold(pc.yellow('→'))} Finding matches for "${pc.cyan(term)}":`);
      // Use git grep for fast multi-file search
      const result = execSync(`git grep -n "${term}" -- "*.ts" "*.tsx" "*.js" | head -n 5`).toString();
      if (result) {
        console.log(pc.gray(result));
      } else {
        console.log(pc.gray('  No direct matches.'));
      }
    } catch (e) {}
  }

  console.log(`\n${pc.green('✔')} Semantic search completed.`);
}

main().catch(console.error);
