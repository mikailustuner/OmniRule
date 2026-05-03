import * as fs from 'fs';
import * as path from 'path';

/**
 * OmniRule Skill Detector
 * 
 * Automatically detects the required expert skills based on project indicators.
 */

export interface SkillMatch {
  name: string;
  confidence: number;
  reason: string;
}

const INDICATORS: Record<string, { files?: string[], deps?: string[] }> = {
  'nextjs-expert': { files: ['next.config.js', 'next.config.ts', 'app/'], deps: ['next'] },
  'tailwind-expert': { files: ['tailwind.config.js', 'postcss.config.js'], deps: ['tailwindcss'] },
  'prisma-expert': { files: ['schema.prisma', 'prisma/'], deps: ['@prisma/client'] },
  'typescript-expert': { files: ['tsconfig.json'], deps: ['typescript'] },
  'docker-patterns': { files: ['Dockerfile', 'docker-compose.yml'] },
};

export async function detectProjectSkills(root: string): Promise<SkillMatch[]> {
  const matches: SkillMatch[] = [];
  const files = fs.readdirSync(root, { recursive: true }) as string[];
  
  let dependencies: string[] = [];
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    dependencies = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  }

  for (const [skill, triggers] of Object.entries(INDICATORS)) {
    let confidence = 0;
    let reason = '';

    if (triggers.files?.some(f => files.some(file => file.includes(f)))) {
      confidence = 1.0;
      reason = 'Indicator files detected';
    } else if (triggers.deps?.some(d => dependencies.includes(d))) {
      confidence = 0.9;
      reason = 'Indicator dependencies detected';
    }

    if (confidence > 0) {
      matches.push({ name: skill, confidence, reason });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}
