import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';

async function main() {
  console.log(pc.bgYellow(pc.black(' OMNIRULE AUTO-ADR GENERATOR ')));
  const adrDir = path.join(process.cwd(), 'docs', 'adr');
  await fs.ensureDir(adrDir);

  const title = process.argv.slice(2).join(' ') || 'New Architectural Change';
  const id = (await fs.readdir(adrDir)).length + 1;
  const fileName = `${id.toString().padStart(4, '0')}-${title.toLowerCase().replace(/\s+/g, '-')}.md`;
  const filePath = path.join(adrDir, fileName);

  console.log(`${pc.blue('i')} Drafting Architectural Decision Record #${id}...`);

  const adrTemplate = `
# ADR ${id}: ${title}

## Status
Proposed (Drafted by OmniRule Auto-ADR)

## Context
Provide the context and problem statement here. Why are we making this change?

## Decision
What is the proposed solution? Describe the architecture, libraries, and patterns used.

## Consequences
- **Positive:** What benefits does this bring?
- **Negative:** What are the trade-offs or technical debt introduced?
- **Risks:** What could go wrong?

## Verification
How was this decision verified? (Tests, Research, Spike)

---
*Generated: ${new Date().toISOString()}*
`;

  await fs.writeFile(filePath, adrTemplate);
  console.log(`\n${pc.green('✔')} ADR Drafted: ${pc.cyan(filePath)}`);
  console.log(pc.gray('Next Step: Use the ArchitectAgent to review and finalize this ADR.'));
}

main().catch(console.error);
