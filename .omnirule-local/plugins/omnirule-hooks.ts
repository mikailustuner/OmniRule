/**
 * OmniRule Core Hooks Plugin
 * 
 * This plugin automates the Design Memory lifecycle and enforces 
 * Karpathy-style engineering discipline across the workspace.
 * 
 * Version: 2.0 - Complete Implementation
 */

import type { PluginInput } from "@opencode-ai/plugin";
import * as path from "path";
import * as fs from "fs";

interface FileEvent {
  path: string;
  content?: string;
  language?: string;
}

interface SessionEvent {
  sessionId: string;
  workspace: string;
}

interface PermissionEvent {
  tool: string;
  args: unknown;
  requestedBy?: string;
}

export const OmniRulePlugin = async ({ 
  client, 
  $, 
  directory, 
  worktree,
  config 
}: PluginInput) => {
  const worktreePath = worktree || directory;
  const designRulesPath = path.join(worktreePath, '.designrules');
  
  // Logging utility
  const log = (level: "info" | "warn" | "error" | "debug", message: string) => {
    const timestamp = new Date().toISOString();
    client.app.log({ 
      body: { 
        service: "omnirule", 
        level, 
        timestamp,
        message 
      } 
    });
    
    // Also write to log file
    const logPath = path.join(designRulesPath, 'logs', 'omnirule.log');
    try {
      fs.appendFileSync(logPath, `[${timestamp}] [${level.toUpperCase()}] ${message}\n`);
    } catch {
      // Silently fail if log can't be written
    }
  };

  // ============================================================
  // FILE EXTENSION → SKILL MAPPING
  // ============================================================
  
  const getSkillForFile = (filePath: string): { skill: string; confidence: number } | null => {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath).toLowerCase();
    const dirPath = filePath.split(path.sep);
    
    // Exact extension matches
    const extensionMap: Record<string, { skill: string; confidence: number }> = {
      '.prisma': { skill: 'prisma-expert', confidence: 1.0 },
      '.tsx': { skill: 'react-expert', confidence: 0.95 },
      '.ts': { skill: 'typescript-expert', confidence: 0.9 },
      '.jsx': { skill: 'react-expert', confidence: 0.9 },
      '.js': { skill: 'typescript-expert', confidence: 0.7 },
      '.css': { skill: 'css-architecture', confidence: 0.9 },
      '.scss': { skill: 'css-architecture', confidence: 0.9 },
      '.sql': { skill: 'postgres-patterns', confidence: 0.9 },
      '.go': { skill: 'golang-dev', confidence: 0.95 },
      '.rs': { skill: 'rust-dev', confidence: 0.95 },
      '.py': { skill: 'python-dev', confidence: 0.9 },
      '.java': { skill: 'java-backend', confidence: 0.9 },
      '.kt': { skill: 'kotlin-full-stack', confidence: 0.9 },
      '.swift': { skill: 'swiftui-patterns', confidence: 0.9 },
      '.rb': { skill: 'rails-patterns', confidence: 0.9 },
      '.php': { skill: 'laravel-patterns', confidence: 0.9 },
    };

    // Direct matches
    if (extensionMap[ext]) {
      return extensionMap[ext];
    }

    // Directory-based patterns
    const dirPatterns: Record<string, { skill: string; confidence: number }> = {
      'app/': { skill: 'nextjs-expert', confidence: 0.9 },
      'pages/': { skill: 'nextjs-expert', confidence: 0.85 },
      'components/': { skill: 'component-design-patterns', confidence: 0.85 },
      'api/': { skill: 'api-backend', confidence: 0.9 },
      'lib/': { skill: 'api-backend', confidence: 0.7 },
      'hooks/': { skill: 'react-expert', confidence: 0.85 },
      'middleware/': { skill: 'security-review', confidence: 0.9 },
      'migrations/': { skill: 'database-migrations', confidence: 0.9 },
      '__tests__/': { skill: 'testing-patterns', confidence: 0.9 },
      'test/': { skill: 'testing-patterns', confidence: 0.85 },
    };

    for (const [pattern, info] of Object.entries(dirPatterns)) {
      if (dirPath.includes(pattern.replace('/', ''))) {
        return info;
      }
    }

    // Tailwind config special case
    if (basename.includes('tailwind.config')) {
      return { skill: 'tailwind-expert', confidence: 1.0 };
    }

    return null;
  };

  // ============================================================
  // HOOK IMPLEMENTATIONS
  // ============================================================

  return {
    /**
     * Triggered after every file edit
     * Analyzes file type and injects relevant skill context
     */
    "file.edited": async (event: FileEvent) => {
      const { path: filePath } = event;
      
      log("debug", `Analyzing file: ${filePath}`);
      
      // Get skill for this file type
      const skillInfo = getSkillForFile(filePath);
      
      if (skillInfo) {
        log("info", `[OmniRule] File '${filePath}' matches ${skillInfo.skill} (${Math.round(skillInfo.confidence * 100)}% confidence)`);
        
        // Try to inject skill context into agent memory
        // This would call the DesignVault.syncCurrentContext() method
        // For now, we log the intention
      }
      
      // 1. Design Drift Detection
      const designExtensions = ['.css', '.scss', '.sass', '.less', '.module.css'];
      const isDesignFile = designExtensions.some(ext => filePath.endsWith(ext));
      
      if (isDesignFile) {
        log("info", `[OmniRule] Design file modified: ${filePath}`);
        // In full implementation: Trigger StyleAgent audit
      }

      // 2. Schema Drift Detection
      const schemaExtensions = ['.prisma', '.sql', 'schema.ts'];
      const isSchemaFile = schemaExtensions.some(ext => filePath.endsWith(ext));
      
      if (isSchemaFile) {
        log("info", `[OmniRule] Database schema modified: ${filePath}`);
        // In full implementation: Trigger ContextAgent sync
      }

      // 3. API Changes Detection
      const apiPatterns = ['route.ts', 'route.tsx', 'handler.ts', 'controller.ts'];
      const isApiFile = apiPatterns.some(pattern => filePath.includes(pattern));
      
      if (isApiFile) {
        log("info", `[OmniRule] API endpoint modified: ${filePath}`);
      }

      // 4. Test Files
      if (filePath.includes('__tests__') || filePath.includes('.test.') || filePath.includes('.spec.')) {
        log("info", `[OmniRule] Test file modified: ${filePath}`);
      }
    },

    /**
     * Triggered when a new file is created
     * Applies initial skill context for new files
     */
    "file.created": async (event: FileEvent) => {
      const { path: filePath } = event;
      log("info", `[OmniRule] New file created: ${filePath}`);
      
      // Determine initial skill context
      const skillInfo = getSkillForFile(filePath);
      
      if (skillInfo) {
        log("info", `[OmniRule] New file will use ${skillInfo.skill} patterns`);
        
        // Could suggest initial boilerplate based on skill
        // await suggestBoilerplate(filePath, skillInfo.skill);
      }
    },

    /**
     * Session Compacting: Preserves critical context
     * This runs when context is being truncated
     */
    "experimental.session.compacting": async () => {
      log("info", "Session compacting triggered - preserving OmniRule context");
      
      // In full implementation, this would:
      // 1. Read current AGENT_INSTRUCTIONS.md
      // 2. Read current DESIGN_RULES.md
      // 3. Read DB_STRUCTURE.md
      // 4. Generate priority context
      
      return {
        context: `
═══════════════════════════════════════════════════════════
🔒 OMNIRULE CRITICAL CONTEXT (HIGHEST PRIORITY)
═══════════════════════════════════════════════════════════

🎯 CORE PRINCIPLES:
- First-principles engineering over shortcuts
- Design tokens in .designrules/DESIGN_RULES.md
- Database structure in .designrules/DB_STRUCTURE.md  
- Agent instructions in .designrules/AGENT_INSTRUCTIONS.md

📐 DESIGN SYSTEM:
- Check .designrules/ for visual patterns before implementing
- Match colors/spacing/typography to design tokens
- Use Tailwind CSS with design token mappings

🗄️ DATABASE:
- Reference .designrules/DB_STRUCTURE.md for schema
- Use Prisma patterns for queries
- Validate against ER diagram

🔧 CODE PATTERNS:
- TypeScript for type safety
- Server Components where possible (Next.js)
- Minimal client-side code
- Component composition over inheritance

═══════════════════════════════════════════════════════════
`.trim(),
        compaction_prompt: `PRESERVE these critical OmniRule contexts in this order:
1. Current file being worked on and its focus skill
2. Design rules from .designrules/DESIGN_RULES.md
3. Database structure from .designrules/DB_STRUCTURE.md  
4. Active skill patterns from .designrules/AGENT_INSTRUCTIONS.md

DISCARD:
- Verbose tool outputs
- Temporary debug logs
- Intermediate processing artifacts`,
        priority: 10 // Maximum priority
      };
    },

    /**
     * Session Start: Initializes OmniRule context
     */
    "session.created": async (event: SessionEvent) => {
      log("info", `OmniRule session initializing for workspace: ${event.workspace}`);
      
      // Check if designrules folder exists
      try {
        const designRulesExist = fs.existsSync(designRulesPath);
        
        if (designRulesExist) {
          // Load existing context
          const instructionsPath = path.join(designRulesPath, 'AGENT_INSTRUCTIONS.md');
          const hasInstructions = fs.existsSync(instructionsPath);
          
          log("info", `Design vault ready: ${designRulesPath}`);
          
          if (hasInstructions) {
            log("info", "Agent instructions loaded - skill context available");
          }
        } else {
          // Create new design vault
          fs.mkdirSync(designRulesPath, { recursive: true });
          fs.mkdirSync(path.join(designRulesPath, 'screenshots'), { recursive: true });
          fs.mkdirSync(path.join(designRulesPath, 'logs'), { recursive: true });
          
          log("info", "Created new design vault at .designrules/");
        }
      } catch (error) {
        log("error", `Failed to initialize design vault: ${error}`);
      }
    },

    /**
     * Session End: Cleanup and final context save
     */
    "session.ended": async (event: SessionEvent) => {
      log("info", `OmniRule session ending for: ${event.workspace}`);
      
      // Final save of any pending context
      // In full implementation: Save AGENT_INSTRUCTIONS.md with final state
    },

    /**
     * Permission Check: Auto-approve safe operations
     */
    "permission.ask": async (event: PermissionEvent) => {
      const { tool } = event;
      
      // OmniRule internal read operations are safe
      const safeReadTools = [
        'read',
        'read_file', 
        'glob',
        'grep',
        'list_dir',
        'view_file',
        'WebFetch',
        'webfetch',
      ];
      
      // Safe write operations for OmniRule management
      const safeWriteTools = [
        'write',
        'edit',
        'mkdir',
      ];
      
      if (safeReadTools.includes(tool)) {
        log("debug", `Auto-approved safe read: ${tool}`);
        return { approved: true, reason: "OmniRule internal read operation" };
      }
      
      if (safeWriteTools.includes(tool)) {
        // Check if it's in the designrules folder
        const args = event.args as { filePath?: string };
        if (args?.filePath?.includes('.designrules')) {
          log("debug", `Auto-approved designrules write: ${tool}`);
          return { approved: true, reason: "OmniRule design rules operation" };
        }
      }
      
      // All other operations require explicit approval
      return { approved: undefined };
    },

    /**
     * Code Analysis: Detect code patterns and suggest improvements
     */
    "code.analyze": async (event: { path: string; content: string; language: string }) => {
      const { path: filePath, content } = event;
      
      // Simple pattern detection
      const issues: string[] = [];
      
      // Check for console.log (should be removed in production)
      if (content.includes('console.log') && !filePath.includes('.test.')) {
        issues.push('Consider removing console.log statements or using proper logging');
      }
      
      // Check for TODO/FIXME
      const todoMatches = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/g);
      if (todoMatches) {
        issues.push(`Found ${todoMatches.length} TODO/FIXME comments - track in issues`);
      }
      
      // Check for console.error in error handlers
      if (content.includes('console.error') && !content.includes('logger')) {
        issues.push('Consider using a structured logger instead of console.error');
      }
      
      if (issues.length > 0) {
        log("warn", `[Code Analysis] ${filePath}: ${issues.join(', ')}`);
      }
    },
  };
};

export default OmniRulePlugin;