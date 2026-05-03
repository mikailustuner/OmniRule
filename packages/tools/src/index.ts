/**
 * OmniRule Tools
 * 
 * Global executable utilities for OmniRule Skills and Agents.
 * Includes skill detection, project scanning, and compliance checking.
 * 
 * Exports:
 *   - scanProjectDNA: Discover project tech stack
 *   - checkFileCompliance: Check code patterns
 *   - detectSkillsForFile: Detect appropriate skill for file
 *   - detectProjectSkills: Detect skills for entire project
 *   - runCLI: CLI entry point
 * 
 * Version: 1.0.0
 */

import fs from 'fs-extra';
import path from 'path';

// Re-export from skill-detector
export { 
  detectSkillsForFile, 
  detectProjectSkills, 
  runSkillDetectorCLI as runCLI,
  type SkillMatch,
  type DetectionResult 
} from './skill-detector.js';

import { detectSkillsForFile, detectProjectSkills, runSkillDetectorCLI as runCLI } from './skill-detector.js';

// ============================================================
// BACKWARDS COMPATIBILITY EXPORTS
// ============================================================

/**
 * Universal Project Scanner
 * Discovers the dominant tech stack in a directory.
 * 
 * @deprecated Use detectProjectSkills() instead for richer detection
 */
export async function scanProjectDNA(root: string) {
  const dna = {
    stack: [] as string[],
    database: 'none',
    styling: 'none',
    isNextJs: false
  };

  const packageJsonPath = path.join(root, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const pkg = await fs.readJson(packageJsonPath);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps.next) { dna.isNextJs = true; dna.stack.push('Next.js'); }
    if (deps.tailwindcss) dna.styling = 'Tailwind CSS';
    if (deps.prisma) dna.database = 'Prisma';
    if (deps.typescript) dna.stack.push('TypeScript');
  }

  return dna;
}

/**
 * Check file compliance against patterns
 * 
 * @deprecated Use skill-detector content patterns instead
 */
export async function checkFileCompliance(filePath: string, patterns: RegExp[]) {
  const content = await fs.readFile(filePath, 'utf-8');
  return patterns.map(p => ({
    pattern: p.toString(),
    matches: p.test(content)
  }));
}

// ============================================================
// CLI ENTRY POINT
// ============================================================

// Allow direct CLI execution
const isMain = import.meta.url.startsWith('file:') && 
               (process.argv[1] === path.resolve(new URL(import.meta.url).pathname) ||
                process.argv[1] === new URL(import.meta.url).pathname);

if (isMain) {
  runCLI();
}

export default {
  scanProjectDNA,
  checkFileCompliance,
  detectSkillsForFile,
  detectProjectSkills,
  runCLI
};