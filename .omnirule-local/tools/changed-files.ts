import { buildTree, getChangedPaths, hasChanges, type ChangeType, type TreeNode } from '../lib/changed-files-store.js';
import pc from 'picocolors';
import fs from 'fs';

const INDICATORS: Record<ChangeType, string> = {
  added: pc.green('+'),
  modified: pc.yellow('~'),
  deleted: pc.red('-'),
};

function renderTree(nodes: TreeNode[], indent: string): string {
  const lines: string[] = [];
  // Sort: directories first, then files
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.children.length > 0 && b.children.length === 0) return -1;
    if (a.children.length === 0 && b.children.length > 0) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const node of sortedNodes) {
    const indicator = node.changeType ? ` [${INDICATORS[node.changeType]}]` : "";
    const isDir = node.children.length > 0;
    const name = isDir ? pc.blue(node.name) + '/' : node.name;
    
    lines.push(`${indent}${name}${indicator}`);
    if (isDir) {
      lines.push(renderTree(node.children, `${indent}  `));
    }
  }
  return lines.join('\n');
}

async function main() {
  const filterArg = process.argv.find(a => a.startsWith('--filter='))?.split('=')[1] as ChangeType;
  const formatArg = process.argv.find(a => a.startsWith('--format='))?.split('=')[1] || 'tree';

  if (!hasChanges()) {
    console.log(pc.gray('No files changed in this session.'));
    return;
  }

  const paths = getChangedPaths(filterArg);

  if (formatArg === 'json') {
    const output = {
      changed: true,
      files: paths.map((p: any) => ({ path: p.path, type: p.changeType })),
      tree: buildTree(paths)
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  console.log(`${pc.blue('i')} Changed files (Navigable Tree):\n`);
  const tree = buildTree(paths);
  console.log(renderTree(tree, ''));

  console.log(`\n${pc.bold('Quick Actions:')}`);
  const gitDiffs = paths
    .filter((p: any) => p.changeType !== 'added')
    .slice(0, 3)
    .map((p: any) => `  git diff ${p.path}`)
    .join('\n');

  if (gitDiffs && fs.existsSync('.git')) {
    console.log(pc.gray(gitDiffs));
  } else {
    console.log(pc.gray('  Use "cat <path>" to view file contents.'));
  }
}

main().catch(console.error);
