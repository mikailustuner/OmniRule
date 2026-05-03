import fs from 'fs-extra';
import path from 'path';
import color from 'picocolors';

// ============================================================
// COMPREHENSIVE ERROR HANDLING & LOGGING SYSTEM
// ============================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  error?: Error;
  context?: Record<string, unknown>;
}

export class OmniRuleLogger {
  private logPath: string;
  private level: LogLevel;
  private entries: LogEntry[] = [];
  private maxEntries = 1000;

  constructor(vaultPath: string = '.designrules', level: LogLevel = LogLevel.INFO) {
    this.logPath = path.join(process.cwd(), vaultPath, 'logs', 'omnirule.log');
    this.level = level;

    // Ensure log directory exists
    const logDir = path.dirname(this.logPath);
    fs.ensureDirSync(logDir);
  }

  private log(level: LogLevel, source: string, message: string, error?: Error, context?: Record<string, unknown>) {
    if (level < this.level) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      error,
      context
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    // Also write to file
    this.writeToFile(entry);
  }

  private writeToFile(entry: LogEntry) {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRIT'];
    const line = `[${entry.timestamp}] [${levelNames[entry.level]}] [${entry.source}] ${entry.message}${entry.error ? `\n  Error: ${entry.error.message}` : ''}\n`;

    try {
      fs.appendFileSync(this.logPath, line);
    } catch {
      // Silently fail if we can't write
    }
  }

  debug(source: string, message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, source, message, undefined, context);
  }

  info(source: string, message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, source, message, undefined, context);
  }

  warn(source: string, message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, source, message, undefined, context);
  }

  error(source: string, message: string, error?: Error, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, source, message, error, context);
  }

  critical(source: string, message: string, error?: Error, context?: Record<string, unknown>) {
    this.log(LogLevel.CRITICAL, source, message, error, context);
  }

  getRecentEntries(count: number = 50): LogEntry[] {
    return this.entries.slice(-count);
  }

  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter(e => e.level === level);
  }

  clear() {
    this.entries = [];
  }
}

// Global logger instance
let globalLogger: OmniRuleLogger | null = null;

export function getLogger(vaultPath?: string): OmniRuleLogger {
  if (!globalLogger) {
    globalLogger = new OmniRuleLogger(vaultPath);
  }
  return globalLogger;
}

// ============================================================
// ERROR CLASSES
// ============================================================

export class OmniRuleError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly source: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'OmniRuleError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      source: this.source,
      context: this.context
    };
  }
}

export class SkillNotFoundError extends OmniRuleError {
  constructor(skillName: string, source: string = 'DesignVault') {
    super(
      `Skill '${skillName}' not found in skills directory`,
      'SKILL_NOT_FOUND',
      source,
      { skillName }
    );
    this.name = 'SkillNotFoundError';
  }
}

export class VaultInitializationError extends OmniRuleError {
  constructor(cause: Error, vaultPath?: string) {
    super(
      `Failed to initialize DesignVault: ${cause.message}`,
      'VAULT_INIT_FAILED',
      'DesignVault',
      { vaultPath, cause: cause.message }
    );
    this.name = 'VaultInitializationError';
  }
}

export class ContextSyncError extends OmniRuleError {
  constructor(filePath: string, cause: Error) {
    super(
      `Failed to sync context for '${filePath}': ${cause.message}`,
      'CONTEXT_SYNC_FAILED',
      'DesignVault',
      { filePath, cause: cause.message }
    );
    this.name = 'ContextSyncError';
  }
}

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface SkillMatch {
  name: string;
  confidence: number;
  reason: string;
}

export class DesignVault {
  private vaultPath: string;
  private memoryPath: string;
  private skillCache: Map<string, string> = new Map();

  // ============================================================
  // COMPREHENSIVE FILE EXTENSION → SKILL MAPPING
  // This is the heart of dynamic skill activation
  // ============================================================

  private readonly extensionMap: Record<string, { skill: string; confidence: number; reason: string }> = {
    // DATABASE & ORM
    '.prisma': { skill: 'prisma-expert', confidence: 1.0, reason: 'ORM schema definition' },
    '.sql': { skill: 'postgres-patterns', confidence: 0.9, reason: 'SQL database queries' },
    '.sqlite': { skill: 'prisma-expert', confidence: 0.8, reason: 'SQLite database' },

    // JAVASCRIPT/TYPESCRIPT
    '.ts': { skill: 'typescript-expert', confidence: 0.95, reason: 'TypeScript source code' },
    '.tsx': { skill: 'react-expert', confidence: 0.95, reason: 'React component (TSX)' },
    '.js': { skill: 'typescript-expert', confidence: 0.7, reason: 'JavaScript source' },
    '.jsx': { skill: 'react-expert', confidence: 0.9, reason: 'React component (JSX)' },
    '.mjs': { skill: 'nodejs-expert', confidence: 0.9, reason: 'ES Module JavaScript' },
    '.cjs': { skill: 'nodejs-expert', confidence: 0.8, reason: 'CommonJS module' },

    // BACKEND
    '.py': { skill: 'python-dev', confidence: 0.9, reason: 'Python backend code' },
    '.go': { skill: 'golang-dev', confidence: 0.95, reason: 'Go backend code' },
    '.rs': { skill: 'rust-dev', confidence: 0.95, reason: 'Rust systems code' },
    '.java': { skill: 'java-backend', confidence: 0.9, reason: 'Java enterprise code' },
    '.kt': { skill: 'kotlin-full-stack', confidence: 0.9, reason: 'Kotlin mobile/backend' },
    '.swift': { skill: 'swiftui-patterns', confidence: 0.9, reason: 'Swift iOS/macOS' },
    '.rb': { skill: 'rails-patterns', confidence: 0.9, reason: 'Ruby on Rails' },
    '.php': { skill: 'laravel-patterns', confidence: 0.9, reason: 'PHP Laravel code' },

    // FRAMEWORKS - Next.js/Frontend
    'page.ts': { skill: 'nextjs-expert', confidence: 1.0, reason: 'Next.js page route' },
    'page.tsx': { skill: 'nextjs-expert', confidence: 1.0, reason: 'Next.js page route' },
    'layout.ts': { skill: 'nextjs-expert', confidence: 1.0, reason: 'Next.js layout' },
    'layout.tsx': { skill: 'nextjs-expert', confidence: 1.0, reason: 'Next.js layout' },
    'route.ts': { skill: 'api-backend', confidence: 0.95, reason: 'Next.js API route' },
    'route.tsx': { skill: 'nextjs-expert', confidence: 0.9, reason: 'Next.js route handler' },
    'api/': { skill: 'api-backend', confidence: 0.9, reason: 'Backend API endpoint' },

    // STYLING
    '.css': { skill: 'css-architecture', confidence: 0.9, reason: 'CSS stylesheet' },
    '.scss': { skill: 'css-architecture', confidence: 0.9, reason: 'Sass stylesheet' },
    '.less': { skill: 'css-architecture', confidence: 0.8, reason: 'Less stylesheet' },
    'tailwind.config.js': { skill: 'tailwind-expert', confidence: 1.0, reason: 'Tailwind config' },
    'tailwind.config.ts': { skill: 'tailwind-expert', confidence: 1.0, reason: 'Tailwind config (TS)' },
    '.module.css': { skill: 'css-variables', confidence: 0.9, reason: 'CSS modules' },

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
    'terraform': { skill: 'terraform-basics', confidence: 0.9, reason: 'Terraform IaC' },
    '.tf': { skill: 'terraform-basics', confidence: 0.9, reason: 'Terraform config' },
    'kubernetes': { skill: 'kubernetes-basics', confidence: 0.9, reason: 'K8s manifest' },
    '.k8s.yaml': { skill: 'kubernetes-basics', confidence: 0.9, reason: 'K8s manifest' },

    // INFRASTRUCTURE
    '.toml': { skill: 'api-backend', confidence: 0.7, reason: 'TOML config' },
    '.ini': { skill: 'api-backend', confidence: 0.6, reason: 'INI config' },
    '.env': { skill: 'security-review', confidence: 0.9, reason: 'Environment variables' },
    '.env.local': { skill: 'security-review', confidence: 0.9, reason: 'Local env secrets' },

    // DATA & GRAPHQL
    '.graphql': { skill: 'graphql-patterns', confidence: 1.0, reason: 'GraphQL schema/queries' },
    '.gql': { skill: 'graphql-patterns', confidence: 1.0, reason: 'GraphQL schema' },
    '.proto': { skill: 'api-backend', confidence: 0.8, reason: 'Protocol buffer' },

    // TESTING
    '.test.ts': { skill: 'testing-patterns', confidence: 0.9, reason: 'TypeScript test' },
    '.test.tsx': { skill: 'testing-patterns', confidence: 0.9, reason: 'React test' },
    '.spec.ts': { skill: 'testing-patterns', confidence: 0.9, reason: 'Test specification' },
    '.spec.tsx': { skill: 'testing-patterns', confidence: 0.9, reason: 'React test spec' },
    '__tests__': { skill: 'testing-patterns', confidence: 0.9, reason: 'Test directory' },
    'e2e.ts': { skill: 'testing-patterns', confidence: 0.9, reason: 'End-to-end test' },

    // DOCUMENTATION
    '.md': { skill: 'documentation-patterns', confidence: 0.7, reason: 'Markdown documentation' },
    'readme.md': { skill: 'documentation-patterns', confidence: 0.9, reason: 'Project README' },
    'changelog.md': { skill: 'documentation-patterns', confidence: 0.8, reason: 'Changelog' },
    '.mdx': { skill: 'documentation-patterns', confidence: 0.8, reason: 'MDX documentation' },

    // STATE MANAGEMENT
    'store.ts': { skill: 'state-management', confidence: 0.9, reason: 'State store' },
    'store.tsx': { skill: 'state-management', confidence: 0.9, reason: 'React store' },
    'context.ts': { skill: 'state-management', confidence: 0.9, reason: 'React context' },
    'context.tsx': { skill: 'state-management', confidence: 0.9, reason: 'React context' },

    // COMPONENT PATTERNS
    'component.tsx': { skill: 'component-design-patterns', confidence: 0.9, reason: 'UI component' },
    'component.ts': { skill: 'component-design-patterns', confidence: 0.8, reason: 'Component logic' },
    'hooks/': { skill: 'react-expert', confidence: 0.9, reason: 'Custom React hooks' },
    'use': { skill: 'react-expert', confidence: 0.85, reason: 'Custom hook file' },

    // AUTH & SECURITY
    'auth': { skill: 'authentication-patterns', confidence: 0.9, reason: 'Authentication logic' },
    'middleware.ts': { skill: 'security-review', confidence: 0.9, reason: 'Security middleware' },
    'middleware.tsx': { skill: 'security-review', confidence: 0.9, reason: 'Auth middleware' },

    // DEVOPS & CI/CD
    '.gitlab-ci.yml': { skill: 'ci-cd-patterns', confidence: 0.9, reason: 'GitLab CI pipeline' },
    '.github/': { skill: 'ci-cd-patterns', confidence: 0.9, reason: 'GitHub Actions workflow' },
    '.circleci/': { skill: 'ci-cd-patterns', confidence: 0.9, reason: 'CircleCI config' },
    'jenkinsfile': { skill: 'ci-cd-patterns', confidence: 0.9, reason: 'Jenkins pipeline' },

    // DATABASE MIGRATIONS
    'migrations/': { skill: 'database-migrations', confidence: 0.9, reason: 'Database migrations' },
    'seeds/': { skill: 'postgres-patterns', confidence: 0.8, reason: 'Database seeds' },

    // SPECIAL PATTERNS
    'index.ts': { skill: 'typescript-expert', confidence: 0.6, reason: 'Entry point (verify context)' },
    'index.tsx': { skill: 'react-expert', confidence: 0.7, reason: 'React entry point' },
    'app.ts': { skill: 'api-backend', confidence: 0.8, reason: 'Application entry' },
    'server.ts': { skill: 'nodejs-expert', confidence: 0.9, reason: 'Server entry point' },
    'worker.ts': { skill: 'nodejs-expert', confidence: 0.8, reason: 'Background worker' },
  };

  // Directory-based patterns (for routes, pages, etc.)
  private readonly directoryMap: Record<string, { skill: string; confidence: number; reason: string }> = {
    'app/': { skill: 'nextjs-expert', confidence: 0.9, reason: 'Next.js App Router directory' },
    'pages/': { skill: 'nextjs-expert', confidence: 0.85, reason: 'Next.js Pages directory' },
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
    '.next/': { skill: 'nextjs-expert', confidence: 0.6, reason: 'Next.js build output' },
    'node_modules/': { skill: 'nodejs-expert', confidence: 0.3, reason: 'Dependencies (ignore)' },
  };

  constructor(siteName: string) {
    this.vaultPath = path.join(process.cwd(), '.designrules', siteName.replace(/[^a-z0-9]/gi, '_').toLowerCase());
    this.memoryPath = path.join(process.cwd(), '.memory');
  }


  async initialize() {
    await fs.ensureDir(this.vaultPath);
    await fs.ensureDir(path.join(this.vaultPath, 'screenshots'));
    await fs.ensureDir(path.join(this.vaultPath, 'logs'));

    // Maximized Memory Structure
    await fs.ensureDir(this.memoryPath);
    await fs.ensureDir(path.join(this.memoryPath, 'commands')); // Project-specific SOPs
    await fs.ensureDir(path.join(this.memoryPath, 'tools'));    // Project-specific utilities
    await fs.ensureDir(path.join(this.memoryPath, 'agents'));   // Project-specific agent personas
  }

  // ============================================================
  // SMART SKILL DETECTION ALGORITHM
  // Uses multiple signals: file extension, directory, content
  // ============================================================

  async detectSkillsForFile(filePath: string): Promise<SkillMatch[]> {
    const matches: SkillMatch[] = [];
    const normalizedPath = filePath.toLowerCase();
    const ext = path.extname(filePath);
    const basename = path.basename(filePath);
    const dirPath = path.dirname(filePath);

    // 1. Check exact file extension match
    if (this.extensionMap[ext]) {
      const match = this.extensionMap[ext];
      matches.push({
        name: match.skill,
        confidence: match.confidence,
        reason: match.reason
      });
    }

    // 2. Check basename patterns
    for (const [pattern, info] of Object.entries(this.extensionMap)) {
      if (basename.includes(pattern.replace('.', ''))) {
        matches.push({
          name: info.skill,
          confidence: info.confidence * 0.8, // Slightly lower for pattern match
          reason: `Filename pattern: ${pattern}`
        });
      }
    }

    // 3. Check directory patterns
    for (const [dirPattern, info] of Object.entries(this.directoryMap)) {
      if (normalizedPath.includes(dirPattern.replace('/', path.sep))) {
        // Check if directory pattern is more specific
        const specificity = normalizedPath.split(dirPattern.replace('/', path.sep)).length;
        matches.push({
          name: info.skill,
          confidence: info.confidence * (0.9 - (specificity * 0.05)), // More specific = higher
          reason: `Directory match: ${dirPattern}`
        });
      }
    }

    // 4. Deduplicate and sort by confidence
    const uniqueMatches = new Map<string, SkillMatch>();
    for (const match of matches) {
      const existing = uniqueMatches.get(match.name);
      if (!existing || match.confidence > existing.confidence) {
        uniqueMatches.set(match.name, match);
      }
    }

    return Array.from(uniqueMatches.values())
      .sort((a, b) => b.confidence - a.confidence);
  }

  // ============================================================
  // DYNAMIC CONTEXT SYNC WITH CONFIDENCE THRESHOLD
  // ============================================================

  /**
   * Proje bazlı hafızayı kaydeder.
   */
  async saveProjectMemory(patterns: string, instincts: any[]) {
    await fs.writeFile(path.join(this.memoryPath, 'patterns.md'), patterns);
    await fs.writeFile(path.join(this.memoryPath, 'instincts.json'), JSON.stringify(instincts, null, 2));
  }

  async syncCurrentContext(
    activeFile: string,
    detectedSkills: SkillMatch[] = [],
    minConfidence: number = 0.5
  ): Promise<SkillMatch[]> {
    // Auto-detect skills if not provided
    if (detectedSkills.length === 0) {
      detectedSkills = await this.detectSkillsForFile(activeFile);
    }

    // Filter by confidence threshold
    const relevantSkills = detectedSkills.filter(s => s.confidence >= minConfidence);

    if (relevantSkills.length === 0 && detectedSkills.length > 0) {
      relevantSkills.push(detectedSkills[0]);
    }

    // Load Project Memory Patterns
    let projectPatterns = '';
    try {
      const patternPath = path.join(this.memoryPath, 'patterns.md');
      if (await fs.pathExists(patternPath)) {
        projectPatterns = await fs.readFile(patternPath, 'utf-8');
      }
    } catch (e) { }

    // Get content for all relevant skills
    let skillInjections = '';
    for (const skill of relevantSkills) {
      const content = await this.getSkillContent(skill.name);
      if (content) {
        const isFocused = skill === relevantSkills[0];
        skillInjections += this.formatSkillInjection(skill, content, isFocused);
      }
    }

    // Generate comprehensive agent instructions with MEMORY FIRST
    const content = this.generateAgentInstructions(activeFile, relevantSkills, skillInjections, projectPatterns);
    await fs.writeFile(path.join(this.vaultPath, 'AGENT_INSTRUCTIONS.md'), content);

    return relevantSkills;
  }

  private formatSkillInjection(skill: SkillMatch, content: string, isFocused: boolean): string {
    const focusLabel = isFocused ? '🔥 HOT FOCUS' : '📚 SKILL';
    return `\n--- ${focusLabel}: ${skill.name} (${Math.round(skill.confidence * 100)}%) ---\n${skill.reason}\n\n${content}\n`;
  }

  private generateAgentInstructions(
    activeFile: string,
    skills: SkillMatch[],
    injections: string,
    projectMemory: string = ''
  ): string {
    const focusSkill = skills[0]?.name || 'NONE';

    return `# 🧠 OMNIRULE AGENTIC MEMORY LOCK
## CURRENT FILE: ${activeFile}
## FOCUS SKILL: ${focusSkill}

## 🔥 0. PROJECT-SPECIFIC MEMORY (ABSOLUTE PRIORITY)
This project has learned the following patterns from its own codebase and history.
YOU MUST ADHERE TO THESE BEFORE ANY GLOBAL SKILLS.

${projectMemory || '*No project-specific patterns learned yet. Running "omnirule learn" is recommended.*'}

---

## 📋 1. ACTIVE EXPERT SKILLS
The following expert rulesets are active for this file.

${injections}


## 🛠️ 2. ACTIONABLE PROJECT ASSETS
Check these directories for project-specific operations:

- **Commands**: \`.memory/commands/*.md\` (Step-by-step SOPs for this project)
- **Tools**: \`.memory/tools/*.ts\` (Executable utilities for this project)
- **Agents**: \`.memory/agents/*.md\` (Specialized personas for specific tasks)

---

## 🎯 CONTEXT RULES

1. **PROJECT MEMORY FIRST** - Always follow .memory/ patterns over general rules.
2. **Follow HOT FOCUS patterns** - The primary skill matched this file.
3. **Check dependencies** - Ensure imported modules follow their respective patterns.
4. **Verify design consistency** - UI code should match design rules in .designrules/.

---


## 📁 MEMORY LOCATIONS

- **Project Memory**: \`.memory/\` (Commands, Tools, Patterns)
- **Global OmniRule Library**: \`packages/commands/\`, \`packages/tools/\`
- **User Config Fallback**: \`~/.config/opencode/\`
- **Vault Assets**: \`${this.vaultPath}/\`

Generated: ${new Date().toISOString()}
`;
  }

  // ============================================================
  // SKILL CONTENT LOADER WITH CACHING
  // ============================================================

  async getSkillContent(skillName: string): Promise<string> {
    if (this.skillCache.has(skillName)) {
      return this.skillCache.get(skillName)!;
    }

    const homeDir = process.env.HOME || process.env.USERPROFILE || '';

    const possiblePaths = [
      path.join(process.cwd(), 'skills', skillName, 'SKILL.md'),
      path.join(process.cwd(), 'skills', skillName.toLowerCase(), 'SKILL.md'),
      path.join(homeDir, '.config', 'opencode', 'skills', skillName, 'SKILL.md'),
      path.join(homeDir, '.config', 'opencode', 'skills', skillName.toLowerCase(), 'SKILL.md'),
    ];

    for (const skillPath of possiblePaths) {
      try {
        if (await fs.pathExists(skillPath)) {
          const content = await fs.readFile(skillPath, 'utf-8');
          const stripped = this.stripYamlHeader(content);
          this.skillCache.set(skillName, stripped);
          return stripped;
        }
      } catch (e) { }
    }

    return '';
  }

  private stripYamlHeader(content: string): string {
    // Remove YAML frontmatter
    const yamlMatch = content.match(/^---\n[\s\S]*?\n---/);
    if (yamlMatch && yamlMatch[0]) {
      return content.replace(yamlMatch[0], '').trim();
    }
    return content.trim();
  }

  // ============================================================
  // DATABASE STRUCTURE HANDLING
  // ============================================================

  async saveDbContext(entities: any[]) {
    let content = `# DATABASE STRUCTURE\n\n`;

    if (entities.length === 0) {
      content += '*No entities detected in current project*\n';
    } else {
      content += `## Entities (${entities.length})\n\n`;
      entities.forEach(entity => {
        content += `### ${entity.name}\n`;
        if (entity.fields) {
          entity.fields.forEach((f: any) => {
            content += `- **${f.name}**: ${f.type}${f.isRelation ? ' (Relation)' : ''}\n`;
          });
        }
        content += '\n';
      });
    }

    // Generate Mermaid ER Diagram
    content += "\n## ER Diagram (Mermaid)\n```mermaid\n";
    content += "erDiagram\n";
    if (entities.length > 0) {
      entities.forEach(entity => {
        content += `  ${entity.name} {\n`;
        if (entity.fields) {
          entity.fields.forEach((f: any) => {
            if (!f.isRelation) {
              content += `    ${this.mermaidType(f.type)} ${f.name}\n`;
            }
          });
        }
        content += `  }\n`;
      });

      // Add relationships
      entities.forEach(entity => {
        if (entity.fields) {
          entity.fields.forEach((f: any) => {
            if (f.isRelation && f.relationType) {
              const relation = f.relationType === 'one-to-many' ? '||--o{' : f.relationType === 'many-to-one' ? '}o--||' : '}o--o{';
              content += `  ${entity.name} ${relation} ${f.relatedEntity}\n`;
            }
          });
        }
      });
    }
    content += "```\n";

    await fs.writeFile(path.join(this.vaultPath, 'DB_STRUCTURE.md'), content);
  }

  private mermaidType(type: string): string {
    const mapping: Record<string, string> = {
      'String': 'string',
      'Int': 'int',
      'BigInt': 'int',
      'Float': 'float',
      'Boolean': 'bool',
      'DateTime': 'datetime',
      'UUID': 'uuid',
      'Json': 'json',
      'Text': 'text',
    };
    return mapping[type] || 'string';
  }

  // ============================================================
  // SESSION COMPACTING (CONTEXT PRESERVATION)
  // ============================================================

  async getSessionCompaction(): Promise<{ context: string; prompt: string; priority: number }> {
    try {
      // Read current agent instructions
      const agentInstructionsPath = path.join(this.vaultPath, 'AGENT_INSTRUCTIONS.md');
      const agentInstructions = await fs.pathExists(agentInstructionsPath)
        ? await fs.readFile(agentInstructionsPath, 'utf-8')
        : '';

      // Read design rules
      const designRulesPath = path.join(this.vaultPath, 'DESIGN_RULES.md');
      const designRules = await fs.pathExists(designRulesPath)
        ? await fs.readFile(designRulesPath, 'utf-8')
        : '';

      // Read DB structure
      const dbStructurePath = path.join(this.vaultPath, 'DB_STRUCTURE.md');
      const dbStructure = await fs.pathExists(dbStructurePath)
        ? await fs.readFile(dbStructurePath, 'utf-8')
        : '';

      // Extract the most critical parts
      const focusMatch = agentInstructions.match(/## CURRENT FILE: ([^\n]+)/);
      const skillMatch = agentInstructions.match(/## FOCUS SKILL: ([^\n]+)/);
      const hotFocusMatch = agentInstructions.match(/🔥 HOT FOCUS: ([^\n]+)/);

      return {
        context: `
═══════════════════════════════════════════════════════════
🔒 OMNIRULE CRITICAL CONTEXT (NEVER DISCARD)
═══════════════════════════════════════════════════════════

📁 PROJECT: ${this.vaultPath.split('/').pop()}

🎯 CURRENT WORKING FILE: ${focusMatch ? focusMatch[1] : 'Unknown'}
🔑 FOCUS SKILL: ${skillMatch ? skillMatch[1] : 'Unknown'}
🔥 HOT FOCUS: ${hotFocusMatch ? hotFocusMatch[1] : 'None'}

📐 DESIGN TOKENS: ${designRules ? 'Available in .designrules' : 'Not available'}
🗄️ DB STRUCTURE: ${dbStructure ? 'Available in .designrules' : 'Not available'}
⚙️ ACTIVE RULES: ${agentInstructions ? 'See .designrules/AGENT_INSTRUCTIONS.md' : 'None'}

═══════════════════════════════════════════════════════════
`.trim(),
        prompt: `You are working on: ${focusMatch ? focusMatch[1] : 'unknown file'}.
Use the ${skillMatch ? skillMatch[1] : 'relevant'} skill patterns.
CRITICAL: If you encounter any design, database, or architecture questions, reference the files in .designrules/ folder before making assumptions.`,
        priority: 10 // Highest priority - always preserve
      };
    } catch (error) {
      // Fallback if anything fails
      return {
        context: `OmniRule active. Project context available in .designrules/`,
        prompt: 'Follow OmniRule engineering patterns. Check .designrules/ for context.',
        priority: 5
      };
    }
  }

  // ============================================================
  // SKILL AUTO-DETECTION FOR PROJECT
  // ============================================================

  async detectProjectSkills(): Promise<SkillMatch[]> {
    const projectRoot = process.cwd();
    const projectSkills: SkillMatch[] = [];
    const skillCounts: Record<string, number> = {};

    // Scan for key files to determine project type
    const indicatorFiles: Record<string, string[]> = {
      'nextjs-expert': ['next.config.js', 'next.config.ts', 'app/'],
      'react-expert': ['package.json'],
      'tailwind-expert': ['tailwind.config.js', 'tailwind.config.ts', 'postcss.config.js'],
      'prisma-expert': ['prisma/schema.prisma', 'schema.prisma'],
      'typescript-expert': ['tsconfig.json'],
      'nodejs-expert': ['package.json'],
      'docker-patterns': ['Dockerfile', 'docker-compose.yml'],
      'terraform-basics': ['main.tf', 'terraform.tf'],
      'kubernetes-basics': ['kubernetes/', 'k8s/', '.yaml'],
      'graphql-patterns': ['schema.graphql'],
    };

    for (const [skill, indicators] of Object.entries(indicatorFiles)) {
      let count = 0;
      for (const indicator of indicators) {
        const filePath = path.join(projectRoot, indicator);
        if (await fs.pathExists(filePath)) {
          count++;
        }
        // Also check recursively in subdirectories
        const searchPath = path.join(projectRoot, indicator);
        try {
          if (await fs.pathExists(searchPath)) {
            count++;
          }
        } catch {
          // Ignore errors for recursive checks
        }
      }
      if (count > 0) {
        skillCounts[skill] = count;
      }
    }

    // Convert to SkillMatch array
    for (const [skill, count] of Object.entries(skillCounts)) {
      projectSkills.push({
        name: skill,
        confidence: Math.min(count * 0.3, 0.9), // Cap at 0.9
        reason: `Project contains ${count} indicator files`
      });
    }

    // Sort by confidence
    projectSkills.sort((a, b) => b.confidence - a.confidence);

    return projectSkills;
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  async saveRules(content: string) {
    await fs.writeFile(path.join(this.vaultPath, 'DESIGN_RULES.md'), content);
  }

  async saveTailwindConfig(content: string) {
    await fs.writeFile(path.join(this.vaultPath, 'tailwind.config.js'), content);
  }

  async saveSkills(skills: string[]) {
    let content = "# ACTIVE SKILLS\n\n";
    skills.forEach(skill => {
      content += `- ${skill}\n`;
    });
    await fs.writeFile(path.join(this.vaultPath, 'ACTIVE_SKILLS.md'), content);
  }

  async saveScreenshot(buffer: Buffer, name: string) {
    const filePath = path.join(this.vaultPath, 'screenshots', name);
    await fs.writeFile(filePath, buffer);
  }

  getVaultPath() {
    return this.vaultPath;
  }

  getSkillCacheSize(): number {
    return this.skillCache.size;
  }

  clearSkillCache(): void {
    this.skillCache.clear();
  }
}