import { execSync } from 'child_process';
import path from 'path';

export type ChangeType = 'added' | 'modified' | 'deleted';

export interface ChangedFile {
  path: string;
  changeType: ChangeType;
  name: string;
}

export interface TreeNode {
  name: string;
  changeType?: ChangeType;
  children: TreeNode[];
}

export function getChangedPaths(filter?: ChangeType): ChangedFile[] {
  try {
    // Get staged and unstaged changes compared to HEAD
    const status = execSync('git status --short').toString().trim();
    if (!status) return [];

    const lines = status.split('\n');
    const files: ChangedFile[] = [];

    for (const line of lines) {
      const code = line.substring(0, 2).trim();
      const filePath = line.substring(3).trim();
      
      let changeType: ChangeType | undefined;
      if (code === 'A' || code === '??') changeType = 'added';
      else if (code === 'M') changeType = 'modified';
      else if (code === 'D') changeType = 'deleted';

      if (changeType && (!filter || changeType === filter)) {
        files.push({
          path: filePath,
          changeType,
          name: path.basename(filePath)
        });
      }
    }

    return files;
  } catch (error: any) {
    try {
      const output = execSync('find . -maxdepth 3 -not -path "*/.*" -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \\) | head -n 50', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (!output) return [];
      
      return output.split('\n')
        .map(line => line.replace(/^\.\//, ''))
        .filter(line => !line.includes('node_modules') && !line.includes('dist'))
        .map(filePath => ({
          path: filePath,
          changeType: 'added' as ChangeType,
          name: path.basename(filePath)
        }))
        .filter(f => !filter || f.changeType === filter);
    } catch (e) {
      return [];
    }
  }
}

export function buildTree(filesOrFilter?: ChangedFile[] | ChangeType): TreeNode[] {
  const files = Array.isArray(filesOrFilter) ? filesOrFilter : getChangedPaths(filesOrFilter);
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      
      let node = currentLevel.find(n => n.name === part);
      
      if (!node) {
        node = {
          name: part,
          changeType: isLast ? file.changeType : undefined,
          children: []
        };
        currentLevel.push(node);
      }
      
      currentLevel = node.children;
    }
  }

  return root;
}

export function hasChanges(): boolean {
  return getChangedPaths().length > 0;
}
