/**
 * OmniRule: Autonomous Agentic Engineering Plugin
 * 
 * This file serves as the main entry point and metadata definition for the 
 * OmniRule ecosystem, enabling it to function as a publishable OpenCode plugin.
 */

export const VERSION = "2.0.0";

export const metadata = {
  name: "omnirule-core",
  version: VERSION,
  description: "High-fidelity autonomous orchestration layer and engineering toolkit.",
  author: "OmniRule Team",
  features: {
    agents: 11,
    commands: 8,
    skills: 16,
    configAssets: true,
    hookEvents: [
      "file.edited",
      "tool.execute.before",
      "tool.execute.after",
      "session.created",
      "prompt",
      "stop",
      "bash.execute.before",
      "file.write.before"
    ],
    customTools: [
      "quality-gate",
      "security-audit",
      "lint-check",
      "check-coverage",
      "git-summary",
      "changed-files",
      "system-burst",
      "logic-extractor",
      "schema-visualizer",
      "knowledge-bridge",
      "visual-audit",
      "dependency-sentinel",
      "red-team",
      "auto-adr",
      "semantic-search",
      "instinct-status"
    ],
  },
};

/**
 * Hook Definitions:
 * These will be intercepted by the Orchestrator to enforce 
 * the Mandatory Plan-Review-Execute lifecycle.
 */
export const hooks = {
  onFileEdited: (file: string) => {
    // Logic to trigger tool:lint or tool:quality
  },
  onToolBeforeExecute: (tool: string) => {
    // Logic to enforce user approval for dangerous tools
  }
};

export default {
  VERSION,
  metadata,
  hooks
};
