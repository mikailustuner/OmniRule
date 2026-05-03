/**
 * OmniRule Skill Detector CLI
 * 
 * Detects the appropriate skill(s) for a given file or directory.
 * Provides confidence-scored skill recommendations for agents.
 * 
 * Usage:
 *   npx @omnirule/tools skill-detect <file-path>
 *   npx @omnirule/tools skill-detect --project
 *   npx @omnirule/tools skill-detect --interactive
 * 
 * Version: 1.0.0
 */

import fs from 'fs-extra';
import path from 'path';
import picocolors from 'picocolors';

interface SkillMatch {
  skill: string;
  confidence: number;
  reason: string;
  source: 'extension' | 'filename' | 'directory' | 'content';
}

interface DetectionResult {
  file: string;
  type: 'file' | 'directory' | 'project';
  skills: SkillMatch[];
  suggestedSkill: string;
  projectContext?: {
    framework?: string;
    database?: string;
    styling?: string;
    language?: string;
  };
}

// ============================================================
// CORE EXTENSION → SKILL MAPPING
// Based on DesignVault.extensionMap
// ============================================================

const EXTENSION_MAP: Record<string, { skill: string; confidence: number; reason: string }> = {
  // DATABASE & ORM
  '.prisma': { skill: 'prisma-expert', confidence: 1.0, reason: 'ORM schema definition' },
  '.sql': { skill: 'postgres-patterns', confidence: 0.9, reason: 'SQL database queries' },
  '.sqlite': { skill: 'prisma-expert', confidence: 0.8, reason: 'SQLite database' },

  // JAVASCRIPT/TYPESCRIPT - Core
  '.ts': { skill: 'typescript-expert', confidence: 0.95, reason: 'TypeScript source code' },
  '.tsx': { skill: 'react-expert', confidence: 0.95, reason: 'React component (TSX)' },
  '.js': { skill: 'typescript-expert', confidence: 0.7, reason: 'JavaScript source' },
  '.jsx': { skill: 'react-expert', confidence: 0.9, reason: 'React component (JSX)' },
  '.mjs': { skill: 'nodejs-expert', confidence: 0.9, reason: 'ES Module JavaScript' },
  '.cjs': { skill: 'nodejs-expert', confidence: 0.8, reason: 'CommonJS module' },

  // BACKEND LANGUAGES
  '.py': { skill: 'python-dev', confidence: 0.9, reason: 'Python backend code' },
  '.go': { skill: 'golang-dev', confidence: 0.95, reason: 'Go backend code' },
  '.rs': { skill: 'rust-dev', confidence: 0.95, reason: 'Rust systems code' },
  '.java': { skill: 'java-backend', confidence: 0.9, reason: 'Java enterprise code' },
  '.kt': { skill: 'kotlin-full-stack', confidence: 0.9, reason: 'Kotlin mobile/backend' },
  '.swift': { skill: 'swiftui-patterns', confidence: 0.9, reason: 'Swift iOS/macOS' },
  '.rb': { skill: 'rails-patterns', confidence: 0.9, reason: 'Ruby on Rails' },
  '.php': { skill: 'laravel-patterns', confidence: 0.9, reason: 'PHP Laravel code' },

  // FRAMEWORK-SPECIFIC PATTERNS ( filenames)
  'page.ts': { skill: 'nextjs-expert', confidence: 1.0, reason: 'Next.js page route' },
  'page.tsx': { skill: 'nextjs-expert', confidence: 1.0, reason: 'Next.js page route' },
  'layout.ts': { skill: 'nextjs-expert', confidence: 1.0, reason: 'Next.js layout' },
  'layout.tsx': { skill: 'nextjs-expert', confidence: 1.0, reason: 'Next.js layout' },
  'route.ts': { skill: 'api-backend', confidence: 0.95, reason: 'Next.js API route' },
  'route.tsx': { skill: 'api-backend', confidence: 0.9, reason: 'API route handler' },
  'middleware.ts': { skill: 'security-review', confidence: 0.9, reason: 'Security middleware' },
  'middleware.tsx': { skill: 'security-review', confidence: 0.9, reason: 'Auth middleware' },
  'store.ts': { skill: 'state-management', confidence: 0.9, reason: 'State store' },
  'store.tsx': { skill: 'state-management', confidence: 0.9, reason: 'React store' },
  'context.ts': { skill: 'state-management', confidence: 0.9, reason: 'React context' },
  'context.tsx': { skill: 'state-management', confidence: 0.9, reason: 'React context' },
  'hooks.ts': { skill: 'react-expert', confidence: 0.9, reason: 'Custom React hooks' },
  'hooks.tsx': { skill: 'react-expert', confidence: 0.9, reason: 'React hooks' },

  // STYLING
  '.css': { skill: 'css-architecture', confidence: 0.9, reason: 'CSS stylesheet' },
  '.scss': { skill: 'css-architecture', confidence: 0.9, reason: 'Sass stylesheet' },
  '.less': { skill: 'css-architecture', confidence: 0.8, reason: 'Less stylesheet' },
  '.module.css': { skill: 'css-variables', confidence: 0.9, reason: 'CSS modules' },
  '.module.scss': { skill: 'css-variables', confidence: 0.9, reason: 'Sass modules' },
  'tailwind.config.js': { skill: 'tailwind-expert', confidence: 1.0, reason: 'Tailwind config' },
  'tailwind.config.ts': { skill: 'tailwind-expert', confidence: 1.0, reason: 'Tailwind config (TS)' },
  'postcss.config.js': { skill: 'tailwind-expert', confidence: 0.9, reason: 'PostCSS config' },

  // MOBILE
  '.native.ts': { skill: 'mobile-patterns', confidence: 0.9, reason: 'React Native component' },
  '.android.ts': { skill: 'mobile-patterns', confidence: 0.8, reason: 'Android-specific code' },
  '.ios.ts': { skill: 'mobile-patterns', confidence: 0.8, reason: 'iOS-specific code' },

  // CONFIGURATION
  'dockerfile': { skill: 'docker-patterns', confidence: 0.9, reason: 'Docker container config' },
  '.dockerignore': { skill: 'docker-patterns', confidence: 0.8, reason: 'Docker ignore rules' },
  'docker-compose.yml': { skill: 'docker-patterns', confidence: 0.9, reason: 'Docker Compose config' },
  'docker-compose.yaml': { skill: 'docker-patterns', confidence: 0.9, reason: 'Docker Compose config' },
  '.yml': { skill: 'ci-cd-patterns', confidence: 0.7, reason: 'YAML configuration' },
  '.yaml': { skill: 'ci-cd-patterns', confidence: 0.7, reason: 'YAML configuration' },
  '.toml': { skill: 'api-backend', confidence: 0.7, reason: 'TOML config' },
  '.ini': { skill: 'api-backend', confidence: 0.6, reason: 'INI config' },
  '.env': { skill: 'security-review', confidence: 0.9, reason: 'Environment variables' },
  '.env.local': { skill: 'security-review', confidence: 0.9, reason: 'Local env secrets' },

  // TERRAFORM & K8S
  '.tf': { skill: 'terraform-basics', confidence: 0.9, reason: 'Terraform config' },
  '.k8s.yaml': { skill: 'kubernetes-basics', confidence: 0.9, reason: 'K8s manifest' },

  // DATA & GRAPHQL
  '.graphql': { skill: 'graphql-patterns', confidence: 1.0, reason: 'GraphQL schema/queries' },
  '.gql': { skill: 'graphql-patterns', confidence: 1.0, reason: 'GraphQL schema' },
  '.proto': { skill: 'api-backend', confidence: 0.8, reason: 'Protocol buffer' },

  // TESTING
  '.test.ts': { skill: 'testing-patterns', confidence: 0.9, reason: 'TypeScript test' },
  '.test.tsx': { skill: 'testing-patterns', confidence: 0.9, reason: 'React test' },
  '.spec.ts': { skill: 'testing-patterns', confidence: 0.9, reason: 'Test specification' },
  '.spec.tsx': { skill: 'testing-patterns', confidence: 0.9, reason: 'React test spec' },
  '.e2e.ts': { skill: 'testing-patterns', confidence: 0.9, reason: 'End-to-end test' },

  // DOCUMENTATION
  '.md': { skill: 'documentation-patterns', confidence: 0.7, reason: 'Markdown documentation' },
  '.mdx': { skill: 'documentation-patterns', confidence: 0.8, reason: 'MDX documentation' },
  'readme.md': { skill: 'documentation-patterns', confidence: 0.9, reason: 'Project README' },
  'changelog.md': { skill: 'documentation-patterns', confidence: 0.8, reason: 'Changelog' },

  // ENTRY POINTS
  'index.ts': { skill: 'typescript-expert', confidence: 0.6, reason: 'Entry point (verify context)' },
  'index.tsx': { skill: 'react-expert', confidence: 0.7, reason: 'React entry point' },
  'app.ts': { skill: 'api-backend', confidence: 0.8, reason: 'Application entry' },
  'server.ts': { skill: 'nodejs-expert', confidence: 0.9, reason: 'Server entry point' },
  'worker.ts': { skill: 'nodejs-expert', confidence: 0.8, reason: 'Background worker' },
  'main.go': { skill: 'golang-dev', confidence: 1.0, reason: 'Go entry point' },
};

// ============================================================
// DIRECTORY → SKILL MAPPING
// ============================================================

const DIRECTORY_MAP: Record<string, { skill: string; confidence: number; reason: string }> = {
  'app/': { skill: 'nextjs-expert', confidence: 0.9, reason: 'Next.js App Router directory' },
  'pages/': { skill: 'nextjs-expert', confidence: 0.85, reason: 'Next.js Pages directory' },
  'src/': { skill: 'typescript-expert', confidence: 0.8, reason: 'Source code directory' },
  'components/': { skill: 'component-design-patterns', confidence: 0.85, reason: 'UI components directory' },
  'lib/': { skill: 'api-backend', confidence: 0.7, reason: 'Utility library directory' },
  'utils/': { skill: 'typescript-expert', confidence: 0.7, reason: 'Utility functions directory' },
  'hooks/': { skill: 'react-expert', confidence: 0.85, reason: 'React hooks directory' },
  'services/': { skill: 'api-backend', confidence: 0.8, reason: 'Service layer directory' },
  'api/': { skill: 'api-backend', confidence: 0.9, reason: 'REST API routes directory' },
  'controllers/': { skill: 'api-backend', confidence: 0.85, reason: 'API controllers directory' },
  'models/': { skill: 'prisma-expert', confidence: 0.85, reason: 'Data models directory' },
  'schemas/': { skill: 'typescript-expert', confidence: 0.8, reason: 'Validation schemas directory' },
  'middleware/': { skill: 'security-review', confidence: 0.9, reason: 'Middleware directory' },
  'migrations/': { skill: 'database-migrations', confidence: 0.9, reason: 'Database migrations directory' },
  'seeds/': { skill: 'postgres-patterns', confidence: 0.8, reason: 'Database seeds directory' },
  '__tests__/': { skill: 'testing-patterns', confidence: 0.9, reason: 'Test files directory' },
  'test/': { skill: 'testing-patterns', confidence: 0.85, reason: 'Test directory' },
  'tests/': { skill: 'testing-patterns', confidence: 0.85, reason: 'Test directory' },
  'e2e/': { skill: 'testing-patterns', confidence: 0.9, reason: 'E2E test directory' },
  'scripts/': { skill: 'nodejs-expert', confidence: 0.8, reason: 'Build/utility scripts' },
  'config/': { skill: 'api-backend', confidence: 0.75, reason: 'Configuration directory' },
  'public/': { skill: 'web-performance', confidence: 0.7, reason: 'Static assets directory' },
  'assets/': { skill: 'web-performance', confidence: 0.7, reason: 'Static assets directory' },
  'styles/': { skill: 'css-architecture', confidence: 0.8, reason: 'CSS/Styles directory' },
  'prisma/': { skill: 'prisma-expert', confidence: 1.0, reason: 'Prisma database directory' },
  '.github/': { skill: 'ci-cd-patterns', confidence: 0.9, reason: 'GitHub Actions workflow' },
  '.gitlab-ci.yml': { skill: 'ci-cd-patterns', confidence: 0.9, reason: 'GitLab CI pipeline' },
};

// ============================================================
// CONTENT PATTERNS (for deeper detection)
// ============================================================

const CONTENT_PATTERNS: Array<{ pattern: RegExp; skill: string; confidence: number; reason: string }> = [
  // React patterns
  { pattern: /import\s+.*\s+from\s+['"]react['"]/, skill: 'react-expert', confidence: 0.95, reason: 'React import detected' },
  { pattern: /useState|useEffect|useContext/, skill: 'react-expert', confidence: 0.9, reason: 'React hooks detected' },
  { pattern: /export\s+default\s+function\s+\w+Props/, skill: 'react-expert', confidence: 0.85, reason: 'React component props pattern' },
  
  // Next.js patterns
  { pattern: /export\s+async\s+function\s+\w+Props/, skill: 'nextjs-expert', confidence: 0.95, reason: 'Next.js page props' },
  { pattern: /getServerSideProps|getStaticProps/, skill: 'nextjs-expert', confidence: 0.9, reason: 'Next.js data fetching' },
  { pattern: /useSearchParams|usePathname/, skill: 'nextjs-expert', confidence: 0.85, reason: 'Next.js hooks' },
  
  // Node.js patterns
  { pattern: /express\(\)|createExpressServer/, skill: 'nodejs-expert', confidence: 0.95, reason: 'Express server detected' },
  { pattern: /http\.createServer/, skill: 'nodejs-expert', confidence: 0.9, reason: 'Node.js HTTP server' },
  { pattern: /require\(['"]fs['"]\)/, skill: 'nodejs-expert', confidence: 0.7, reason: 'Node.js fs module' },
  
  // Database patterns
  { pattern: /@Prisma\.|prisma\.\w+\./, skill: 'prisma-expert', confidence: 0.95, reason: 'Prisma ORM usage' },
  { pattern: /CREATE TABLE|ALTER TABLE/, skill: 'postgres-patterns', confidence: 0.9, reason: 'SQL DDL statements' },
  { pattern: /SELECT.*FROM|INSERT INTO/, skill: 'postgres-patterns', confidence: 0.8, reason: 'SQL queries' },
  
  // Security patterns
  { pattern: /bcrypt|argon2/, skill: 'security-review', confidence: 0.9, reason: 'Password hashing detected' },
  { pattern: /jwt\.verify|jsonwebtoken/, skill: 'security-review', confidence: 0.9, reason: 'JWT authentication' },
  { pattern: /sanitize|escape.*html/, skill: 'security-review', confidence: 0.85, reason: 'Input sanitization' },
  
  // State management
  { pattern: /create.*Store|zustand/, skill: 'state-management', confidence: 0.9, reason: 'Zustand store' },
  { pattern: /ReduxProvider|configureStore/, skill: 'state-management', confidence: 0.9, reason: 'Redux store' },
  { pattern: /useReducer/, skill: 'state-management', confidence: 0.7, reason: 'React useReducer' },
  
  // Testing patterns
  { pattern: /describe\(|it\(|test\(/, skill: 'testing-patterns', confidence: 0.9, reason: 'Test blocks detected' },
  { pattern: /expect\(|assert\./, skill: 'testing-patterns', confidence: 0.85, reason: 'Test assertions' },
  { pattern: /@testing-library/, skill: 'testing-patterns', confidence: 0.9, reason: 'Testing library usage' },
  
  // API patterns
  { pattern: /@Controller|@RestController/, skill: 'api-backend', confidence: 0.9, reason: 'REST controller' },
  { pattern: /@Get\(|@Post\(|@Put\(|@Delete\(/, skill: 'api-backend', confidence: 0.9, reason: 'API endpoints' },
  { pattern: /app\.(get|post|put|delete)\(/, skill: 'api-backend', confidence: 0.85, reason: 'Express routes' },
  
  // Docker & K8s
  { pattern: /FROM\s+node:|FROM\s+python:/, skill: 'docker-patterns', confidence: 0.9, reason: 'Docker base image' },
  { pattern: /deployment:|service:| Ingress:/, skill: 'kubernetes-basics', confidence: 0.9, reason: 'K8s manifest' },
  { pattern: /terraform\s+{|resource\s+"/, skill: 'terraform-basics', confidence: 0.9, reason: 'Terraform config' },
];

// ============================================================
// MAIN DETECTION FUNCTIONS
// ============================================================

/**
 * Detect skills for a file
 */
export async function detectSkillsForFile(filePath: string): Promise<SkillMatch[]> {
  const matches: SkillMatch[] = [];
  const normalizedPath = filePath.replace(/\\/g, '/');
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath).toLowerCase();
  const dirPath = path.dirname(normalizedPath);

  // 1. Check exact file extension
  if (EXTENSION_MAP[ext]) {
    const match = EXTENSION_MAP[ext];
    matches.push({
      ...match,
      source: 'extension'
    });
  }

  // 2. Check exact filename (without extension)
  if (EXTENSION_MAP[basename]) {
    const match = EXTENSION_MAP[basename];
    // Only add if not duplicate
    if (!matches.find(m => m.skill === match.skill)) {
      matches.push({
        ...match,
        source: 'filename'
      });
    }
  }

  // 3. Check filename containing pattern
  for (const [pattern, info] of Object.entries(EXTENSION_MAP)) {
    if (pattern.includes('.') && basename.includes(pattern.replace('.', ''))) {
      const existing = matches.find(m => m.skill === info.skill);
      if (!existing) {
        matches.push({
          skill: info.skill,
          confidence: info.confidence * 0.8,
          reason: `Filename contains: ${pattern}`,
          source: 'filename'
        });
      }
    }
  }

  // 4. Check directory patterns
  for (const [dirPattern, info] of Object.entries(DIRECTORY_MAP)) {
    if (normalizedPath.includes(dirPattern)) {
      matches.push({
        skill: info.skill,
        confidence: info.confidence * 0.9,
        reason: `Directory match: ${dirPattern}`,
        source: 'directory'
      });
    }
  }

  // 5. Content-based detection (if file exists and is readable)
  try {
    if (await fs.pathExists(filePath) && (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx')) {
      const content = await fs.readFile(filePath, 'utf-8');
      
      for (const { pattern, skill, confidence, reason } of CONTENT_PATTERNS) {
        if (pattern.test(content)) {
          const existing = matches.find(m => m.skill === skill);
          if (existing) {
            // Boost confidence if content confirms
            existing.confidence = Math.min(existing.confidence + 0.1, 1.0);
            existing.reason += ` + ${reason}`;
          } else {
            matches.push({
              skill,
              confidence,
              reason,
              source: 'content'
            });
          }
        }
      }
    }
  } catch {
    // Ignore content read errors
  }

  // Deduplicate and sort by confidence
  return deduplicateAndSort(matches);
}

/**
 * Detect skills for entire project
 */
export async function detectProjectSkills(projectRoot: string): Promise<DetectionResult> {
  const projectContext: DetectionResult['projectContext'] = {};
  const allSkills: SkillMatch[] = [];

  // Check for framework indicators
  const packageJsonPath = path.join(projectRoot, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const pkg = await fs.readJson(packageJsonPath);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps.next) {
      projectContext.framework = 'Next.js';
      allSkills.push({ skill: 'nextjs-expert', confidence: 0.9, reason: 'Next.js in dependencies', source: 'content' });
    }
    if (deps.react) {
      projectContext.framework = 'React';
      allSkills.push({ skill: 'react-expert', confidence: 0.85, reason: 'React in dependencies', source: 'content' });
    }
    if (deps['@prisma/client']) {
      projectContext.database = 'Prisma';
      allSkills.push({ skill: 'prisma-expert', confidence: 0.9, reason: 'Prisma in dependencies', source: 'content' });
    }
    if (deps.tailwindcss) {
      projectContext.styling = 'Tailwind CSS';
      allSkills.push({ skill: 'tailwind-expert', confidence: 0.9, reason: 'Tailwind in dependencies', source: 'content' });
    }
    if (deps.typescript) {
      projectContext.language = 'TypeScript';
    }
    if (deps.python) {
      projectContext.language = 'Python';
    }
  }

  // Check tsconfig
  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  if (await fs.pathExists(tsconfigPath)) {
    allSkills.push({ skill: 'typescript-expert', confidence: 0.9, reason: 'tsconfig.json exists', source: 'filename' });
  }

  // Check for Next.js app directory
  const appDir = path.join(projectRoot, 'app');
  const pagesDir = path.join(projectRoot, 'pages');
  if (await fs.pathExists(appDir)) {
    allSkills.push({ skill: 'nextjs-expert', confidence: 0.95, reason: 'app/ directory found', source: 'directory' });
  } else if (await fs.pathExists(pagesDir)) {
    allSkills.push({ skill: 'nextjs-expert', confidence: 0.85, reason: 'pages/ directory found', source: 'directory' });
  }

  // Check for Prisma schema
  const prismaDir = path.join(projectRoot, 'prisma');
  const schemaPath = path.join(projectRoot, 'schema.prisma');
  if (await fs.pathExists(prismaDir) || await fs.pathExists(schemaPath)) {
    allSkills.push({ skill: 'prisma-expert', confidence: 0.95, reason: 'Prisma schema found', source: 'directory' });
  }

  // Check for Docker
  const dockerfilePath = path.join(projectRoot, 'Dockerfile');
  const composePath = path.join(projectRoot, 'docker-compose.yml');
  if (await fs.pathExists(dockerfilePath)) {
    allSkills.push({ skill: 'docker-patterns', confidence: 0.9, reason: 'Dockerfile found', source: 'filename' });
  }

  // Deduplicate
  const dedupedSkills = deduplicateAndSort(allSkills);

  return {
    file: projectRoot,
    type: 'project',
    skills: dedupedSkills,
    suggestedSkill: dedupedSkills[0]?.skill || 'typescript-expert',
    projectContext
  };
}

/**
 * Deduplicate and sort matches by confidence
 */
function deduplicateAndSort(matches: SkillMatch[]): SkillMatch[] {
  const uniqueMap = new Map<string, SkillMatch>();
  
  for (const match of matches) {
    const existing = uniqueMap.get(match.skill);
    if (!existing || match.confidence > existing.confidence) {
      uniqueMap.set(match.skill, match);
    }
  }

  return Array.from(uniqueMap.values())
    .sort((a, b) => b.confidence - a.confidence);
}

// ============================================================
// CLI INTERFACE
// ============================================================

interface CLIOptions {
  json?: boolean;
  project?: boolean;
  interactive?: boolean;
  verbose?: boolean;
  help?: boolean;
}

/**
 * Run the skill-detector CLI
 */
export async function runSkillDetectorCLI(args: string[] = process.argv.slice(2)) {
  const options: CLIOptions = {
    json: args.includes('--json') || args.includes('-j'),
    project: args.includes('--project') || args.includes('-p'),
    interactive: args.includes('--interactive') || args.includes('-i'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    help: args.includes('--help') || args.includes('-h'),
  };

  // Remove flags from args
  const targetPath = args.find(a => !a.startsWith('-')) || process.cwd();

  // Show help
  if (options.help) {
    console.log(`
${picocolors.bold('OmniRule Skill Detector')}

${picocolors.cyan('Usage:')} omnirule-skill-detect <path> [options]

${picocolors.cyan('Options:')}
  -j, --json        Output as JSON
  -p, --project    Detect for entire project
  -i, --interactive Interactive mode
  -v, --verbose    Show all matches with confidence
  -h, --help       Show this help message

${picocolors.cyan('Examples:')}
  omnirule-skill-detect src/components/Button.tsx
  omnirule-skill-detect . --project --json
  omnirule-skill-detect src/api/users/route.ts -v
`);
    return;
  }

  // Run detection
  let result: DetectionResult;

  try {
    if (options.project) {
      result = await detectProjectSkills(targetPath);
    } else {
      const fileSkills = await detectSkillsForFile(targetPath);
      result = {
        file: targetPath,
        type: 'file',
        skills: fileSkills,
        suggestedSkill: fileSkills[0]?.skill || 'typescript-expert'
      };
    }
  } catch (error) {
    console.error(picocolors.red(`Error: ${error}`));
    process.exit(1);
  }

  // Output
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHumanReadable(result, options.verbose);
  }
}

/**
 * Print result in human-readable format
 */
function printHumanReadable(result: DetectionResult, verbose: boolean = false) {
  const { file, type, skills, suggestedSkill, projectContext } = result;

  console.log(picocolors.bold(`\n🎯 Skill Detection for: ${picocolors.cyan(file)}\n`));
  console.log(picocolors.gray(`  Type: ${type}`));

  if (projectContext && Object.keys(projectContext).length > 0) {
    console.log(picocolors.gray(`  Project Context:`));
    for (const [key, value] of Object.entries(projectContext)) {
      if (value) {
        console.log(picocolors.gray(`    - ${key}: ${picocolors.yellow(value)}`));
      }
    }
  }

  console.log(picocolors.bold(`\n📊 Detected Skills:`));
  
  const displaySkills = verbose ? skills : skills.slice(0, 5);
  
  for (const match of displaySkills) {
    const confidence = Math.round(match.confidence * 100);
    const bar = '█'.repeat(Math.floor(confidence / 10)) + '░'.repeat(10 - Math.floor(confidence / 10));
    
    if (match.confidence >= 0.8) {
      console.log(`  ${picocolors.green(bar)} ${picocolors.green(confidence + '%')} ${picocolors.bold(match.skill)}`);
    } else if (match.confidence >= 0.6) {
      console.log(`  ${picocolors.yellow(bar)} ${picocolors.yellow(confidence + '%')} ${match.skill}`);
    } else {
      console.log(`  ${picocolors.gray(bar)} ${picocolors.gray(confidence + '%')} ${match.skill}`);
    }
    console.log(picocolors.gray(`       ${match.reason}`));
  }

  if (skills.length > 5 && !verbose) {
    console.log(picocolors.gray(`  ... and ${skills.length - 5} more (use --verbose for full list)`));
  }

  console.log(picocolors.bold(`\n✨ ${picocolors.green('Recommended Skill:')} ${picocolors.green(suggestedSkill)}\n`));
}

// ============================================================
// EXPORTS (for index.ts re-export)
// ============================================================

// Re-export types
export type { SkillMatch, DetectionResult };

// Main functions are already exported above:
// runSkillDetectorCLI, detectSkillsForFile, detectProjectSkills