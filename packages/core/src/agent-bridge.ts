/**
 * OmniRule Agent-Skill Bridge System
 * 
 * Enables agents to automatically read and apply relevant skill context
 * from AGENT_INSTRUCTIONS.md when working on specific files.
 * 
 * Version: 2.0 - Complete Implementation
 */

import * as fs from 'fs';
import * as path from 'path';

export interface AgentContextConfig {
  vaultPath: string;
  instructionsFile: string;
  maxSkills: number;
  minConfidence: number;
}

export interface SkillActivation {
  skill: string;
  confidence: number;
  reason: string;
  trigger: string;
}

export interface AgentInstructions {
  projectName: string;
  skills: SkillActivation[];
  designRules: string[];
  dbContext: string[];
  timestamp: string;
  version: string;
}

const DEFAULT_CONFIG: AgentContextConfig = {
  vaultPath: '.designrules',
  instructionsFile: 'AGENT_INSTRUCTIONS.md',
  maxSkills: 5,
  minConfidence: 0.4
};

/**
 * Agent-Skill Bridge - Main class
 * 
 * Provides methods for agents to:
 * 1. Read current context from AGENT_INSTRUCTIONS.md
 * 2. Request skill activation for specific files
 * 3. Query available skills dynamically
 * 4. Save context changes back to vault
 */
export class AgentSkillBridge {
  private config: AgentContextConfig;
  private currentContext: AgentInstructions | null = null;
  private logger: Logger;

  constructor(config: Partial<AgentContextConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger(this.config.vaultPath);
  }

  // ============================================================
  // PUBLIC API - Called by Agents
  // ============================================================

  /**
   * Load current agent instructions into context
   * Call this at session start or when context is needed
   */
  async loadContext(): Promise<AgentInstructions | null> {
    try {
      const instructionsPath = path.join(
        process.cwd(),
        this.config.vaultPath,
        this.config.instructionsFile
      );

      if (!fs.existsSync(instructionsPath)) {
        this.logger.info('No AGENT_INSTRUCTIONS.md found - returning null');
        return null;
      }

      const content = fs.readFileSync(instructionsPath, 'utf-8');
      this.currentContext = this.parseInstructions(content);
      
      this.logger.info(`Loaded context with ${this.currentContext.skills.length} active skills`);
      return this.currentContext;
    } catch (error) {
      this.logger.error(`Failed to load context: ${error}`);
      return null;
    }
  }

  /**
   * Request skill activation for a file being worked on
   * Returns the top skills that should be applied
   */
  async requestSkillActivation(filePath: string): Promise<SkillActivation[]> {
    this.logger.info(`Skill activation requested for: ${filePath}`);

    // If no context loaded, try to load it
    if (!this.currentContext) {
      await this.loadContext();
    }

    // If still no context, we can't provide skill activation
    if (!this.currentContext) {
      this.logger.warn('No context available - returning default skills');
      return this.getDefaultSkills(filePath);
    }

    // Filter skills by confidence threshold
    const relevantSkills = this.currentContext.skills
      .filter(s => s.confidence >= this.config.minConfidence)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxSkills);

    // Add file-specific reasoning
    const enhanced = relevantSkills.map(skill => ({
      ...skill,
      trigger: filePath,
      reason: this.determineReason(skill.skill, filePath)
    }));

    this.logger.info(`Returning ${enhanced.length} skills for ${filePath}`);
    return enhanced;
  }

  /**
   * Get context summary for current working file
   * Returns a compact version suitable for system prompts
   */
  async getContextSummary(): Promise<string> {
    if (!this.currentContext) {
      await this.loadContext();
    }

    if (!this.currentContext) {
      return 'No OmniRule context available. Work without design rules.';
    }

    const { projectName, skills } = this.currentContext;

    const skillList = skills
      .slice(0, 3)
      .map(s => `${s.skill} (${Math.round(s.confidence * 100)}%)`)
      .join(', ');

    return `
OmniRule Context: ${projectName}
Active Skills: ${skillList || 'None'}
Skills count: ${skills.length}
    `.trim();
  }

  /**
   * Update context after agent completes a task
   * Saves changes back to AGENT_INSTRUCTIONS.md
   */
  async updateContext(updates: Partial<AgentInstructions>): Promise<void> {
    if (!this.currentContext) {
      this.logger.warn('No current context to update');
      return;
    }

    try {
      const newContext = {
        ...this.currentContext,
        ...updates,
        timestamp: new Date().toISOString()
      };

      await this.saveContext(newContext);
      this.currentContext = newContext;
      
      this.logger.info('Context updated successfully');
    } catch (error) {
      this.logger.error(`Failed to update context: ${error}`);
      throw error;
    }
  }

  /**
   * Add a new skill to active context
   */
  async activateSkill(skill: string, confidence: number, reason: string): Promise<void> {
    if (!this.currentContext) {
      await this.loadContext();
    }

    if (!this.currentContext) {
      this.logger.warn('Cannot activate skill - no context');
      return;
    }

    // Check if skill already exists
    const existing = this.currentContext.skills.find(s => s.skill === skill);
    
    if (existing) {
      // Update confidence if higher
      if (confidence > existing.confidence) {
        existing.confidence = confidence;
        existing.reason = reason;
      }
    } else {
      // Add new skill
      this.currentContext.skills.push({
        skill,
        confidence,
        reason,
        trigger: ''
      });
    }

    // Save immediately
    await this.saveContext(this.currentContext);
    this.logger.info(`Skill activated: ${skill} (${Math.round(confidence * 100)}%)`);
  }

  // ============================================================
  // INTERNAL HELPERS
  // ============================================================

  private parseInstructions(content: string): AgentInstructions {
    // Parse AGENT_INSTRUCTIONS.md format
    // Extract project name, skills, design rules, db context
    
    const lines = content.split('\n');
    const instructions: AgentInstructions = {
      projectName: 'Unknown',
      skills: [],
      designRules: [],
      dbContext: [],
      timestamp: new Date().toISOString(),
      version: '2.0'
    };

    let currentSection = '';
    let inSkills = false;

    for (const line of lines) {
      if (line.includes('PROJECT:') || line.includes('**Project:**')) {
        const match = line.match(/[:*]\s*(.+)/);
        if (match) instructions.projectName = match[1].trim();
      }
      else if (line.includes('## Available Skills') || line.includes('### Active Skills')) {
        inSkills = true;
      }
      else if (inSkills && line.includes('- **')) {
        // Parse skill entry: - **skill-name** (85%) - reason
        const match = line.match(/\*\*([^*]+)\*\*\s*\((\d+)%\)\s*[-–]\s*(.+)/);
        if (match) {
          instructions.skills.push({
            skill: match[1].trim(),
            confidence: parseInt(match[2]) / 100,
            reason: match[3].trim(),
            trigger: ''
          });
        }
      }
      else if (line.startsWith('##') || line.startsWith('===')) {
        inSkills = false;
      }
    }

    return instructions;
  }

  private async saveContext(context: AgentInstructions): Promise<void> {
    const instructionsPath = path.join(
      process.cwd(),
      this.config.vaultPath,
      this.config.instructionsFile
    );

    const content = this.formatInstructions(context);
    fs.writeFileSync(instructionsPath, content, 'utf-8');
  }

  private formatInstructions(context: AgentInstructions): string {
    const skillsLines = context.skills
      .sort((a, b) => b.confidence - a.confidence)
      .map(s => `- **${s.skill}** (${Math.round(s.confidence * 100)}%) - ${s.reason}`)
      .join('\n');

    return `
# OmniRule Agent Instructions
**Project:** ${context.projectName}
**Last Updated:** ${context.timestamp}
**Version:** ${context.version}

## Active Skills (Priority Order)
${skillsLines || '_No skills activated_'}

## Design Context
${context.designRules.join('\n') || '_No design rules_'}
${context.dbContext.join('\n') || ''}

---
*This file is auto-generated. Do not edit manually.*
`.trim();
  }

  private getDefaultSkills(filePath: string): SkillActivation[] {
    // Fallback when no context exists
    const ext = path.extname(filePath).toLowerCase();
    
    const defaultSkills: Record<string, { skill: string; confidence: number }> = {
      '.ts': { skill: 'typescript-patterns', confidence: 0.7 },
      '.tsx': { skill: 'react-patterns', confidence: 0.7 },
      '.js': { skill: 'javascript-patterns', confidence: 0.6 },
      '.py': { skill: 'python-patterns', confidence: 0.7 },
      '.go': { skill: 'golang-patterns', confidence: 0.7 },
      '.rs': { skill: 'rust-patterns', confidence: 0.7 },
      '.sql': { skill: 'postgres-patterns', confidence: 0.7 },
    };

    const defaultSkill = defaultSkills[ext] || { skill: 'general-coding', confidence: 0.5 };

    return [{
      skill: defaultSkill.skill,
      confidence: defaultSkill.confidence,
      reason: 'Default skill based on file extension',
      trigger: filePath
    }];
  }

  private determineReason(skill: string, filePath: string): string {
    const ext = path.extname(filePath);
    const dir = path.dirname(filePath).split(path.sep).pop() || '';
    
    return `Triggered by ${ext} file in ${dir} directory`;
  }
}

// ============================================================
// LOGGER
// ============================================================

class Logger {
  private logPath: string;

  constructor(vaultPath: string) {
    this.logPath = path.join(process.cwd(), vaultPath, 'logs', 'agent-bridge.log');
    
    // Ensure log directory exists
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  info(message: string) {
    this.log('INFO', message);
  }

  warn(message: string) {
    this.log('WARN', message);
  }

  error(message: string) {
    this.log('ERROR', message);
  }

  private log(level: string, message: string) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${level}] [AgentSkillBridge] ${message}\n`;
    
    try {
      fs.appendFileSync(this.logPath, entry);
    } catch {
      // Silently fail if we can't write to log
    }
  }
}

// ============================================================
// EXPORTS
// ============================================================

export default AgentSkillBridge;